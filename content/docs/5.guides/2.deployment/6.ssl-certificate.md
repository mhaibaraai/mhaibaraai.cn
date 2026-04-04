---
title: SSL 证书配置
description: SSL 证书配置指南，包含 Cloudflare Origin 证书和 Let's Encrypt 自动续签方案
---

## 方案选择

| 方案 | 适用场景 | 优点 | 缺点 |
|-----|---------|------|------|
| Cloudflare Origin 证书 | 使用 Cloudflare 代理 | 配置简单，有效期长（15年） | 只能通过 Cloudflare 访问 |
| Let's Encrypt + acme.sh | 直接访问源站或需要公共信任证书 | 公共信任，免费 | 需要自动续签 |

## Cloudflare Origin 证书

::warning
Cloudflare Origin 证书**只被 Cloudflare 信任**，不被浏览器信任。直接访问源站 IP 会显示证书错误。
::

### 创建证书

::steps{level="3"}

### 进入 Cloudflare 控制台

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择域名 → SSL/TLS → 源服务器（Origin Server）
3. 点击"创建证书"

### 配置证书选项

- 私钥类型：RSA (2048)
- 主机名：`*.example.com` 和 `example.com`
- 证书有效期：15 年

### 保存证书文件

将证书和私钥保存到服务器：

```sh [sh]
mkdir -p ~/nginx/ssl

# 创建证书文件（粘贴 Origin Certificate 内容）
nano ~/nginx/ssl/example.com.pem

# 创建私钥文件（粘贴 Private Key 内容）
nano ~/nginx/ssl/example.com.key
```

::

### 配置 SSL/TLS 模式

::warning
必须将 SSL/TLS 模式设置为 **Full** 或 **Full (strict)**，否则会出现以下问题：

- **Off**：不加密
- **Flexible**：导致重定向循环（ERR_TOO_MANY_REDIRECTS）或 SSL 525 错误
- **Full**：正确 ✓
- **Full (strict)**：正确 ✓（推荐）
::

在 Cloudflare Dashboard → SSL/TLS → Overview 中设置。

### 常见错误

#### HTTP 525 SSL Handshake Failed

原因：Cloudflare 无法与源站建立 SSL 连接。

排查步骤：

```sh [sh]
# 1. 检查 nginx 是否运行
docker ps

# 2. 检查 443 端口
sudo ss -tlnp | grep 443

# 3. 本地测试 SSL
curl -vk https://127.0.0.1 -H "Host: example.com"

# 4. 检查证书文件
openssl x509 -in ~/nginx/ssl/example.com.pem -noout -issuer -dates
```

#### 证书链不完整

上传到腾讯云等平台时提示"证书链不完整"是正常的，因为 Origin 证书只被 Cloudflare 信任。**无需上传到第三方平台**。

## Let's Encrypt + acme.sh 自动续签

适用于需要公共信任证书或直接访问源站的场景。

### 安装 acme.sh

```sh [sh]
curl https://get.acme.sh | sh -s email=your-email@example.com
source ~/.bashrc
```

### 配置 Cloudflare API

::steps{level="3"}

### 获取 API Token

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 创建 Token → 使用模板 **Edit zone DNS**
3. 权限设置：
   - Zone - DNS - Edit
   - Zone - Zone - Read
4. 区域资源：选择目标域名
5. 保存 Token 和 Zone ID

### 配置凭证

```sh [sh]
cat >> ~/.acme.sh/account.conf << 'EOF'
CF_Token="your_api_token"
CF_Zone_ID="your_zone_id"
EOF
```

::

### 申请证书

```sh [sh]
# 使用 Let's Encrypt（推荐）
~/.acme.sh/acme.sh --issue --dns dns_cf \
  -d example.com \
  -d "*.example.com" \
  --server letsencrypt
```

::note
如果遇到 ZeroSSL 速率限制错误（`retryafter=86400`），添加 `--server letsencrypt` 参数切换 CA。
::

### 安装证书

```sh [sh]
~/.acme.sh/acme.sh --install-cert -d example.com \
  --key-file ~/nginx/ssl/example.com.key \
  --fullchain-file ~/nginx/ssl/example.com.pem \
  --reloadcmd "docker exec nginx nginx -s reload"
```

### 验证自动续签

```sh [sh]
# 查看 cron job
crontab -l | grep acme

# 手动测试续签
~/.acme.sh/acme.sh --cron --home ~/.acme.sh
```

### 卸载 acme.sh

如果需要完全卸载：

```sh [sh]
~/.acme.sh/acme.sh --uninstall
rm -rf ~/.acme.sh
```

## Nginx SSL 配置

```nginx [nginx/server.conf]
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 验证证书

```sh [sh]
# 查看证书信息
openssl x509 -in ~/nginx/ssl/example.com.pem -noout -issuer -subject -dates

# 测试 HTTPS 连接
curl -vI https://example.com 2>&1 | grep -E "(subject|issuer|expire)"

# 使用在线工具
# https://www.sslshopper.com/ssl-checker.html
```
