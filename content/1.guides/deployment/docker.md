---
title: Docker
description: Docker 安装和使用指南
---

## 安装 Docker 环境

在 Ubuntu 系统上安装 Docker 和 Docker Compose：

::code-collapse

```sh [sh]
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 添加 Docker 官方 GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加 Docker 官方稳定源（noble）
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu noble stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新软件包索引
sudo apt-get update

# 安装 Docker 相关组件
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 测试 Docker 是否正常
docker --version
sudo docker run hello-world
```

::

## 配置用户权限

```sh [sh]
# 查看版本
docker --version
# 将当前用户加入 docker 用户组（避免每次都要 sudo）
sudo usermod -aG docker $USER
# 应用用户组变更（需要重新登录或执行）
newgrp docker
# 再次测试
docker run hello-world
```

## Nginx + Docker Compose 项目设置

创建完整的 Nginx + Docker Compose 项目结构：

```sh [sh]
# 设置项目根目录
PROJECT_DIR=~/my-nginx
# 创建目录
mkdir -p $PROJECT_DIR/nginx $PROJECT_DIR/html
```

::code-tree{default-value="docker-compose.yml" expand-all}

```yml [docker-compose.yml]
services:
  nginx:
    image: nginx:latest
    container_name: my-nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./html:/usr/share/nginx/html:ro
    extra_hosts:
      - "host.docker.internal:host-gateway" # 添加这一行，用于容器内访问宿主机端口
    restart: unless-stopped
```

```conf [nginx/default.conf]
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
    }
}
```

```html [html/index.html]
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Nginx on Docker!</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; }
        .container { text-align: center; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        h1 { color: #26953d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello from Nginx!</h1>
        <p>Your Nginx server is running successfully inside a Docker container managed by Docker Compose.</p>
    </div>
</body>
</html>
```

::

成功后，访问 `http://your_ipv4_address`，看到页面就成功了！

![Docker Compose 部署效果](/images/guides/deployment/docker/docker-compose-result.png)

## Cloudflare 配置

### 添加 DNS 记录

在 Cloudflare 中添加 DNS 记录，例如：添加一条 `example.com` 的 A 记录，记录值为 IP 地址 `your_ipv4_address`。

![Cloudflare A 记录配置](/images/guides/deployment/docker/cloudflare-a-record.png)

### SSL 证书创建

::steps{level="4"}

#### 在 Cloudflare 仪表板创建证书

1. 登录 Cloudflare，进入 `example.com` 的管理页面
2. 点击左侧菜单的 "SSL/TLS" -> "源服务器" (Origin Server)
3. 点击 "创建证书" (Create Certificate)
4. 保持默认选项（"由 Cloudflare 生成私钥和 CSR"），主机名列表里应该已经包含了 `*.example.com` 和 `example.com`
5. 点击 "创建"

![Cloudflare 创建证书](/images/guides/deployment/docker/cloudflare-create-certificate.png)

#### 复制并保存证书和私钥

Cloudflare 会立即显示两个文本框：

- 源证书 (Origin Certificate)
- 私钥 (Private Key)

#### 在服务器上存放证书文件

在服务器上创建证书存储目录：

```sh [sh]
mkdir -p /etc/ssl
```

#### 更新配置文件

::code-group

```yaml [docker-compose.yml]
services:
  nginx:
    image: nginx:latest
    container_name: my-nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./html:/usr/share/nginx/html:ro
      - ./etc/ssl:/etc/ssl:ro # 添加这一行，指向您存放证书的目录
    extra_hosts:
      - "host.docker.internal:host-gateway" # 添加这一行，用于容器内访问宿主机端口
    restart: unless-stopped
```

```conf [nginx/default.conf]
server {
    listen 80;
    server_name example.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/ssl/example.com.pem;
    ssl_certificate_key /etc/ssl/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1k;
    gzip_comp_level 5;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri /index.html;
    }
}
```

::

#### 重启 Nginx 容器

```sh [sh]
docker compose down
docker compose up -d
```

## 完整项目目录结构

完成上述所有步骤后，项目目录结构应该如下所示：

```tree [tree]
~/my-nginx/
├── docker-compose.yml          # Docker Compose 配置文件
├── nginx/                      # Nginx 配置目录
│   └── default.conf           # Nginx 服务器配置
├── html/                       # 网站静态文件目录
│   ├── index.html             # 首页文件
└── etc/                       # 证书和配置目录
    └── ssl/                   # SSL 证书目录
        ├── example.com.pem    # SSL 证书文件
        └── example.com.key    # SSL 私钥文件
```
