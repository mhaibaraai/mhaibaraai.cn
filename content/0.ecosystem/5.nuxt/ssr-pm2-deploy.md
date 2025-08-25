---
title: Nuxt SSR + PM2 部署
description: 在 Ubuntu 上使用 PM2 集群模式部署 Nuxt SSR，并通过 Nginx（Docker）反向代理与 Cloudflare 前置加速。
---

## 前置要求与架构说明

- **部署目标**：本项目以 SSR 方式运行，主站由 Nginx（Docker）反代至 Node 服务（PM2 集群托管）。
- **监听策略**：Node 监听 `0.0.0.0:3000`（容器通过 `host.docker.internal` 访问宿主机端口）。
- **域名与 CDN**：域名走 Cloudflare，需关闭 Rocket Loader/Mirage/Email Obfuscation 以避免注入脚本导致水合异常。

::note{to="https://nuxt.com/docs/4.x/getting-started/deployment#nodejs-server"}
参考 Nuxt 官方文档（Node.js Server 入口：`node .output/server/index.mjs`，可用 `HOST/PORT` 或 `NITRO_HOST/NITRO_PORT` 控制）。
::

::note{to="https://pm2.keymetrics.io/docs/usage/quick-start/"}
参考 PM2 官方文档（集群模式 `instances: 'max'`，守护、日志、开机自启、零停机重载）。
::

## 服务器环境准备

::steps{level="3"}

### 安装 PM2

::tip{to="/guides/runtime/node#直接下载安装"}
在 Linux 上安装 Node 22、pnpm 请参考 Node.js 安装指南
::

```sh [sh]
# 安装
npm i -g pm2
# 查看 pm2 版本
pm2 --version
# 查看 pm2 状态
pm2 status
```

![验证 PM2 版本](/images/ecosystem/nuxt/verify-pm2.png)

### 配置 PM2 开机自启

为确保服务器重启后应用自动恢复，需要配置 PM2 开机自启：

```sh [sh]
# 1. 生成并配置启动脚本
pm2 startup

# 2. 保存当前进程列表
pm2 save
```

### 验证 PM2 自启配置

```sh [sh]
# 测试重启后恢复
sudo reboot

# 重启后检查应用状态
pm2 list
pm2 logs
```

::warning
**`pm2 startup` 行为说明**：

**Root 用户**：
- PM2 会自动配置系统服务，无需手动执行额外命令
- 直接创建 `/etc/systemd/system/pm2-root.service` 并启用

**普通用户**：
- PM2 会输出需要手动执行的 sudo 命令
- 需要复制完整的 sudo 命令并执行，例如：
  ```sh
  sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
  ```

**通用注意事项**：
- `pm2 startup` 只需在服务器初次配置时执行一次
- `pm2 save` 在每次应用更新后执行，保持进程列表同步
- 使用 `pm2 unstartup systemd` 可以移除开机自启配置
::

### （可选）UFW 防火墙策略

```sh [sh]
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp
```

::

## Nginx（Docker）反代至 Node（宿主机）

::tip{to="/guides/deployment/docker"}
参考 Docker 安装和使用指南
::

确保 `docker-compose.yml` 已配置：

```yml [docker-compose.yml]
services:
  nginx:
    image: nginx:latest
    container_name: my-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./html:/usr/share/nginx/html:ro
      - ./etc/ssl:/etc/ssl:ro
    extra_hosts:
      - "host.docker.internal:host-gateway" # 添加这一行，用于容器内访问宿主机端口
    restart: unless-stopped
```

将主站从静态目录切换为反代 Node ：

```conf [nginx/default.conf]
server {
    # 主站改为反代到 Node SSR
    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://host.docker.internal:3000;
    }
}
```

重启：

```sh [sh]
docker compose -f /root/my-nginx/docker-compose.yml restart nginx
```

## PM2 配置（集群模式）

在项目根目录新增 `ecosystem.config.cjs`：

```js [ecosystem.config.cjs]
module.exports = {
  apps: [
    {
      name: 'mhaibaraai.cn',
      script: './.output/server/index.mjs',
      exec_mode: 'cluster',
      instances: 'max',
      env: {
        HOST: '0.0.0.0',
        PORT: '3000',
        NITRO_HOST: '0.0.0.0',
        NITRO_PORT: '3000'
      },
      max_memory_restart: '512M',
      out_file: './.pm2/out.log',
      error_file: './.pm2/error.log',
      time: true
    }
  ]
}
```

首启与持久化：

```sh [sh]
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## GitHub Actions（CI）与 SSH 发布

::note
CI Secrets 最小集，其余参数在工作流中直接定义：
- `SSH_PRIVATE_KEY` - SSH 私钥
- `SSH_HOST` - SSH 主机
::

::code-collapse

::code-group

```yml [.github/workflows/deploy.yml]
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      NODE_OPTIONS: --max_old_space_size=4096

    permissions:
      contents: write
      id-token: write

    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Prepare build
        run: pnpm run dev:prepare

      - name: Run build (SSR)
        run: pnpm run build

      - name: Setup SSH agent
        uses: webfactory/ssh-agent@v0.9.1
        with:
          ssh-private-key: |
            ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add known_hosts
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_PORT: 22
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H "$SSH_HOST" -p "$SSH_PORT" >> ~/.ssh/known_hosts

      - name: Deploy to server via SSH
        env:
          SSH_USER: root
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_PORT: 22
          DEPLOY_DIR: /root/my-nginx/html/www/mhaibaraai.cn
          PM2_APP_NAME: mhaibaraai.cn
        run: |
          bash scripts/deploy.sh

      - name: Deploy build artifacts to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./.output
          publish_branch: gh-pages
          force_orphan: true
          commit_message: 'chore(release): build artifacts'
```

```sh [scripts/deploy.sh]
#!/usr/bin/env bash
set -euo pipefail

# Required envs from GitHub Actions
SSH_USER="${SSH_USER:?missing}"
SSH_HOST="${SSH_HOST:?missing}"
SSH_PORT="${SSH_PORT:?missing}"
DEPLOY_DIR="${DEPLOY_DIR:?missing}"
PM2_APP_NAME="${PM2_APP_NAME:-nuxt-app}"

# Fixed deploy directory (no releases)
echo "[deploy] Host=${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "[deploy] Target dir=${DEPLOY_DIR}"

# Local safety checks
[ -n "${DEPLOY_DIR:-}" ] || { echo "[deploy] DEPLOY_DIR empty" >&2; exit 2; }
TARGET_DIR="${DEPLOY_DIR%/}/.output"
if [ -z "$TARGET_DIR" ] || [ "$TARGET_DIR" = "/" ] || [ "$(basename -- "$TARGET_DIR")" != ".output" ]; then
  echo "[deploy] invalid TARGET_DIR='$TARGET_DIR'" >&2
  exit 3
fi
if [ ! -d ./.output ] || [ -z "$(ls -A ./.output 2>/dev/null || true)" ]; then
  echo "[deploy] local ./.output missing or empty" >&2
  exit 4
fi

# Connection options
SSH_OPTS="-p ${SSH_PORT}"
RSYNC_SSH="ssh ${SSH_OPTS}"

# Ensure pm2 directory exists later in remote block; create .output via rsync

# Sync only built artifacts and PM2 ecosystem file
RSYNC_PATH="mkdir -p '${DEPLOY_DIR%/}/.output' && rsync"
rsync -az --delete-after -e "${RSYNC_SSH}" --rsync-path "${RSYNC_PATH}" ./.output/ "${SSH_USER}@${SSH_HOST}":"${DEPLOY_DIR%/}/.output/"
rsync -az -e "${RSYNC_SSH}" ./ecosystem.config.cjs "${SSH_USER}@${SSH_HOST}":"${DEPLOY_DIR}/ecosystem.config.cjs"

# Remote pm2 reload/start (no install/build)
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "export DEPLOY_DIR='${DEPLOY_DIR}' PM2_APP_NAME='${PM2_APP_NAME}'; bash -s" <<'REMOTE_EOF'
set -eo pipefail

export NODE_OPTIONS=--max_old_space_size=1024
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Resolve Node/npm global prefix bin without relying on interactive shells
PREFIX_BIN=""
if command -v npm >/dev/null 2>&1; then
  PREFIX_BIN="$(npm config get prefix 2>/dev/null)/bin"
elif [ -d "$HOME/.local/share/fnm/node-versions" ]; then
  # Fallback: pick the newest installed node version directory
  LATEST_NODE_DIR="$(ls -1dt "$HOME/.local/share/fnm/node-versions"/*/installation 2>/dev/null | head -n 1 || true)"
  [ -n "$LATEST_NODE_DIR" ] && PREFIX_BIN="$LATEST_NODE_DIR/bin"
fi
[ -z "$PREFIX_BIN" ] && PREFIX_BIN="/usr/local/bin"
export PATH="$PREFIX_BIN:$PATH"

echo "[remote] prefix bin: $PREFIX_BIN"

# Locate pm2
PM2_BIN="$(command -v pm2 || true)"
if [ -z "$PM2_BIN" ]; then
  echo "[remote] pm2 not found" >&2
  exit 127
fi

echo "[remote] using pm2: $PM2_BIN"

cd "${DEPLOY_DIR}"
mkdir -p .pm2

echo "[remote] PM2 operation for $PM2_APP_NAME..."
if "$PM2_BIN" describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  "$PM2_BIN" reload "$PM2_APP_NAME" --update-env
else
  PM2_APP_NAME="$PM2_APP_NAME" "$PM2_BIN" start ecosystem.config.cjs
  "$PM2_BIN" save
fi

"$PM2_BIN" status | cat
REMOTE_EOF

echo "[deploy] Completed"
```

::

::

## Nuxt 本地调试脚本

`package.json` 增加 `start` 便于本地/服务调试：

```json [package.json]
{
  "scripts": {
    "start": "node .output/server/index.mjs"
  }
}
```

## 提交站点地图

::tip{to="https://nuxtseo.com/docs/sitemap/guides/submitting-sitemap"}
参考 SEO 指南（站点地图提交）
::

首先确保站点地图已生成，并上传到 `./public/sitemap.xml` 目录下。例如：[`https://mhaibaraai.cn/sitemap.xml`](https://mhaibaraai.cn/sitemap.xml)

![站点地图](/images/ecosystem/nuxt/sitemap.png)

## 验证与排错

- 容器内验证：`curl -I http://host.docker.internal:3000` 应返回 200。
- 通过域名访问页面，关注 `pm2 logs` 与 Nginx 访问/错误日志。
- 若出现 `better-sqlite3` ABI 不匹配，确保在目标机上重新安装与构建（见项目的 Nuxt 踩坑笔记）。

::tip{to="https://nuxt.com/docs/4.x/getting-started/deployment#cdn-proxy"}
如果经 Cloudflare，确保关闭 Rocket Loader/Mirage/Email Obfuscation，防止注入脚本引发水合异常。
::


