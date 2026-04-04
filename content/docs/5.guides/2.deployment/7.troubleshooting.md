---
title: 故障排查
description: 部署过程中常见问题及解决方案
---

## SSL/TLS 相关问题

### HTTP 525 SSL Handshake Failed

**现象**：通过 Cloudflare 访问时返回 525 错误。

**原因**：Cloudflare 无法与源站建立 SSL 连接。

**排查步骤**：

```sh [sh]
# 1. 检查 nginx 容器是否运行
docker ps | grep nginx

# 2. 检查 443 端口是否监听
sudo ss -tlnp | grep 443

# 3. 本地测试 SSL 连接
curl -vk https://127.0.0.1 -H "Host: example.com" 2>&1 | head -20

# 4. 从公网测试（使用在线工具）
# https://www.sslshopper.com/ssl-checker.html#hostname=your_server_ip
```

**解决方案**：

1. 确认 Cloudflare SSL/TLS 模式为 **Full** 或 **Full (strict)**
2. 检查证书文件是否正确放置
3. 检查 nginx 配置语法：`docker exec nginx nginx -t`

### ERR_TOO_MANY_REDIRECTS

**现象**：浏览器显示重定向过多。

**原因**：Cloudflare SSL 模式设置为 **Flexible**，导致循环重定向。

```text
Cloudflare (HTTPS) → Nginx (HTTP:80) → 301 重定向到 HTTPS → Cloudflare → 循环
```

**解决方案**：将 Cloudflare SSL/TLS 模式改为 **Full** 或 **Full (strict)**。

### 证书链不完整

**现象**：上传 Cloudflare Origin 证书到腾讯云等平台时提示"证书链不完整"。

**原因**：Cloudflare Origin 证书只被 Cloudflare 信任，不是公共 CA 证书。

**解决方案**：这是正常现象。Origin 证书无需上传到第三方平台，直接放在 nginx 服务器上使用。

### acme.sh 申请证书失败

**现象**：`retryafter=86400` 错误。

**原因**：ZeroSSL 速率限制。

**解决方案**：

```sh [sh]
# 切换到 Let's Encrypt CA
~/.acme.sh/acme.sh --issue --dns dns_cf \
  -d example.com \
  -d "*.example.com" \
  --server letsencrypt \
  --force
```

### Cloudflare API Token 无效

**现象**：`invalid domain` 错误。

**原因**：API Token 权限不足或 Zone ID 错误。

**解决方案**：

1. 确认 Token 权限包含：
   - Zone - DNS - Edit
   - Zone - Zone - Read
2. 确认 Zone ID 正确（在 Cloudflare 域名概览页右下角）
3. 重新配置凭证：

```sh [sh]
# 清除旧配置
sed -i '/CF_Token/d' ~/.acme.sh/account.conf
sed -i '/CF_Zone_ID/d' ~/.acme.sh/account.conf

# 添加新配置
cat >> ~/.acme.sh/account.conf << 'EOF'
CF_Token="new_token"
CF_Zone_ID="zone_id"
EOF
```

## Docker 网络问题

### IPv4 连接失败，IPv6 正常

**现象**：通过 IPv6 可以正常访问，IPv4 返回连接错误或超时。

**原因**：Docker 对 IPv4 使用 NAT（iptables DNAT），可能与服务器防火墙或安全组冲突。

**排查步骤**：

```sh [sh]
# 检查 Docker iptables 规则
sudo iptables -t nat -L -n | grep 443

# 检查端口映射
docker port nginx
```

**解决方案**：

1. **使用 IPv6**：如果 IPv6 可用，优先使用 AAAA 记录
2. **检查安全组**：确保腾讯云/阿里云安全组允许相应端口
3. **使用 host 网络模式**（不推荐）：

```yaml [docker-compose.yml]
services:
  nginx:
    image: nginx:latest
    network_mode: host
    # 不需要 ports 映射
```

### 容器内无法访问宿主机端口

**现象**：容器内 `curl host.docker.internal:3000` 失败。

**解决方案**：在 `docker-compose.yml` 中添加 `extra_hosts`：

```yaml [docker-compose.yml]
services:
  nginx:
    image: nginx:latest
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

## 数据库连接问题

### 无法远程连接 PostgreSQL/Redis

**现象**：Navicat 连接超时或被拒绝。

**排查步骤**：

1. **检查服务是否运行**：

   ```sh [sh]
   docker ps | grep -E "postgres|redis"
   ```

2. **检查端口监听**：

   ```sh [sh]
   # 如果绑定 127.0.0.1，只能本地访问
   sudo ss -tlnp | grep -E "5432|6379"
   ```

3. **检查安全组**：确保云服务商安全组允许相应端口入站

4. **检查防火墙**：

   ```sh [sh]
   sudo ufw status
   sudo iptables -L -n | grep -E "5432|6379"
   ```

**解决方案**：

::warning
不建议将数据库端口直接暴露到公网。推荐使用 SSH 隧道连接。
::

**SSH 隧道配置**（推荐）：

1. 数据库只监听本地：

   ```yaml [docker-compose.yml]
   ports:
     - '127.0.0.1:5432:5432'
   ```

2. Navicat 中配置 SSH 隧道连接

### 数据库密码错误

**现象**：认证失败。

**解决方案**：

```sh [sh]
# 查看当前配置的密码
cat ~/database/.env

# 或直接在容器内测试
docker exec -it postgres psql -U postgres
docker exec -it redis redis-cli -a 'password' ping
```

## 通用排查命令

```sh [sh]
# 查看所有运行中的容器
docker ps

# 查看容器日志
docker logs <container_name> --tail 50

# 进入容器
docker exec -it <container_name> /bin/sh

# 检查端口占用
sudo ss -tlnp

# 测试端口连通性
nc -zv <host> <port>

# 检查 DNS 解析
dig <domain> +short

# 测试 HTTPS 连接
curl -vI https://<domain> 2>&1 | head -30
```
