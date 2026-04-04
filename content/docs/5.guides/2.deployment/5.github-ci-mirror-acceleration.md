---
title: GitHub CI 镜像加速
description: 在腾讯云服务器上加速拉取 GitHub Actions 构建并推送到 GHCR 的 Docker 镜像。
---

## 方案对比

| 方案 | 速度 | 稳定性 | 成本 | 复杂度 |
|------|------|--------|------|--------|
| 直连 GHCR | 慢/超时 | 差 | 无 | 无 |
| 同步到腾讯云 TCR | 最快（内网） | 最高 | 免费个人版 | 中 |
| Mihomo 代理 | 较快 | 中 | 需代理节点 | 低 |
| CF Workers 代理 | 较快 | 中 | 需域名 | 低 |

## 方案一：同步到腾讯云 TCR

CI 构建完成后同时推送到 GHCR 和腾讯云 TCR，服务器从 TCR 内网拉取。

::steps{level="3"}

### 添加 Secrets

在仓库 **Settings → Secrets** 中添加以下配置：

| Key | Value |
|-----|-------|
| `TCR_REGISTRY` | `ccr.ccs.tencentyun.com` |
| `TCR_NAMESPACE` | TCR 命名空间 |
| `TCR_USERNAME` | 腾讯云账号 ID |
| `TCR_PASSWORD` | TCR 访问凭证密码 |

### 配置 CI 工作流

`docker/metadata-action` 的 `images` 字段支持多个仓库，`build-push-action` 会在构建完成后同时推送到两个仓库，不重复构建。

::code-collapse

```yaml [.github/workflows/build.yml]
name: Build & Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
  TCR_IMAGE: ${{ secrets.TCR_REGISTRY }}/${{ secrets.TCR_NAMESPACE }}/movk-backend

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/login-action@v3
        with:
          registry: ${{ secrets.TCR_REGISTRY }}
          username: ${{ secrets.TCR_USERNAME }}
          password: ${{ secrets.TCR_PASSWORD }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
            ${{ env.TCR_IMAGE }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_SSH_HOST }}
          username: ${{ secrets.PROD_SSH_USER }}
          password: ${{ secrets.PROD_SSH_PASSWORD }}
          port: ${{ vars.PROD_SSH_PORT || 22 }}
          script: |
            cd ~/apps/movk-backend
            docker compose -f docker-compose.yml pull
            docker compose -f docker-compose.yml up -d
            docker image prune -f
```

::

### 修改 docker-compose.yml

```yaml [docker-compose.yml]
services:
  app:
    image: ccr.ccs.tencentyun.com/<namespace>/movk-backend:latest
```

### 登录 TCR（一次性操作）

```sh [sh]
docker login ccr.ccs.tencentyun.com \
  -u <TCR_USERNAME> \
  -p <TCR_PASSWORD>
```

::

## 方案二：Mihomo 代理

在服务器上部署 Mihomo（Clash Meta 内核），让 Docker daemon 通过代理拉取 GHCR 镜像。

::note
需要有可用的代理节点（境外 VPS 或代理订阅），订阅格式必须为 Clash 格式。
::

::steps{level="3"}

### 安装 Mihomo

查看 CPU 等级，决定下载版本：

```sh [sh]
grep -m1 flags /proc/cpuinfo | grep -o 'avx2\|sse4_2'
# 有 avx2 → 用 v3，有 sse4_2 → 用 v2，都没有 → 用 compatible
```

以 `v1.19.20` 为例，`amd64-compatible` 版本兼容性最好：

```sh [sh]
wget https://github.com/MetaCubeX/mihomo/releases/download/v1.19.20/mihomo-linux-amd64-compatible-v1.19.20.gz
gzip -d mihomo-linux-amd64-compatible-v1.19.20.gz
sudo mv mihomo-linux-amd64-compatible-v1.19.20 /usr/local/bin/mihomo
sudo chmod +x /usr/local/bin/mihomo
mihomo -v
```

### 配置订阅文件

::warning
订阅链接请在本地下载后再上传到服务器，大多数订阅服务会拦截云服务器 IP 的直接请求。
::

在**本地**下载订阅配置：

```sh [sh]
curl -o config.yaml "https://你的订阅链接" \
  -H "User-Agent: clash-verge/v2.0.0"
```

上传到服务器：

```sh [sh]
scp -P <端口> config.yaml ubuntu@<服务器IP>:/tmp/config.yaml
```

在**服务器**上移动至配置目录：

```sh [sh]
sudo mkdir -p /etc/mihomo
sudo mv /tmp/config.yaml /etc/mihomo/config.yaml
sudo chmod 644 /etc/mihomo/config.yaml
```

测试启动，看到 `Mixed(http+socks) proxy listening at: 127.0.0.1:7890` 即为成功：

```sh [sh]
sudo mihomo -d /etc/mihomo
```

### 配置 systemd 服务

```sh [sh]
sudo tee /etc/systemd/system/mihomo.service << 'EOF'
[Unit]
Description=Mihomo Proxy
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mihomo -d /etc/mihomo
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mihomo
sudo systemctl start mihomo
```

### 配置 Docker 代理

根据 `config.yaml` 中实际的 `mixed-port` 字段填写端口号：

```sh [sh]
sudo mkdir -p /etc/systemd/system/docker.service.d

sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf << 'EOF'
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7893"
Environment="HTTPS_PROXY=http://127.0.0.1:7893"
Environment="NO_PROXY=localhost,127.0.0.1,ccr.ccs.tencentyun.com"
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 验证连通性

```sh [sh]
# 测试代理连通性
curl -x http://127.0.0.1:7893 https://www.google.com -I

# 测试 Docker 拉取
docker pull ghcr.io/<username>/<image>:latest
```

::

::tip
Mihomo 已设置 `systemctl enable`，服务器重启后会自动启动代理，Docker 代理配置持久生效，无需额外操作。
::

### 更新订阅

Mihomo 在服务器上无法直接拉取订阅（云服务器 IP 被拦截），每次订阅更新需在本地重新下载后上传：

```sh [sh]
# 本地
curl -o config.yaml "https://你的订阅链接" -H "User-Agent: clash-verge/v2.0.0"
scp -P <端口> config.yaml ubuntu@<服务器IP>:/tmp/config.yaml

# 服务器
sudo mv /tmp/config.yaml /etc/mihomo/config.yaml
sudo systemctl restart mihomo
```
