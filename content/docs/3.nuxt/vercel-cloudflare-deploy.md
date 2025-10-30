---
title: Vercel + Cloudflare 部署
description: 使用 Vercel 和 Cloudflare 部署 Nuxt 项目，绑定自定义域名并实现自动化 CI/CD 流程。
---

::note
在开始之前，确保你已拥有：

- 一个 Nuxt 项目
- GitHub/GitLab/Bitbucket 账号
- Vercel 账号（可使用 GitHub 登录）
- Cloudflare 账号
- 已在 Cloudflare 托管的域名（如 `mhaibaraai.cn`）
::

## 第一步：部署到 Vercel

::steps{level="3"}

::callout{to="https://vercel.com"}
访问 Vercel，选择 **Continue with GitHub** 登录。
::

### 导入项目

1. 进入 Vercel 控制台
2. 点击 **Add New...** → **Project**
3. 在列表中找到你的仓库，点击 **Import**

### 配置部署设置

Vercel 会自动检测 Nuxt 框架，通常无需修改默认配置：

![Vercel Nuxt 检测](/images/nuxt/vercel-nuxt-detect.png)

### 配置环境变量（可选）

如果项目需要环境变量，在 **Environment Variables** 区域添加：

```bash
# 示例环境变量
NUXT_PUBLIC_API_BASE=https://api.mhaibaraai.cn
DATABASE_URL=postgresql://user:pass@host:5432/db
```

::tip
敏感信息建议使用 Vercel 的环境变量管理，不要提交到 Git。
::

::

## 第二步：配置 Cloudflare DNS

::steps{level="3"}

### 登录 Cloudflare

::callout{to="https://dash.cloudflare.com"}
访问 Cloudflare Dashboard
::

在域名列表中选择 `mhaibaraai.cn`

### 添加 DNS 记录

进入 **DNS** → **Records**，根据域名类型添加相应记录：

**子域名配置（如 docs.mhaibaraai.cn）：**

| 类型 | 名称 | 目标 | 代理状态 | TTL |
|------|------|------|----------|-----|
| CNAME | docs | cname.vercel-dns.com | **仅 DNS** | 自动 |

**根域名配置（如 mhaibaraai.cn）：**

在 Vercel 添加域名时查看推荐的 A 记录配置：

![Vercel DNS 记录示例](/images/nuxt/vercel-dns-records.png)

| 类型 | 名称 | 目标 | 代理状态 | TTL |
|------|------|------|----------|-----|
| A | mhaibaraai.cn | IPv4 地址 | **仅 DNS** | 自动 |

::warning
**重要提示**

- 代理状态**必须**设置为 **"仅 DNS"**（灰色云朵图标）
- 如果开启代理（橙色云朵），会导致 SSL 证书验证失败
- 目标地址固定为 `cname.vercel-dns.com`
- `@` 符号代表根域名，Cloudflare 会自动将 CNAME 展平为 A 记录
::

::

## 第三步：绑定自定义域名

::steps{level="3"}

### 进入 Vercel 域名设置

1. 在 Vercel 控制台，进入项目页面
2. 点击 **Settings** → **Domains**

### 添加自定义域名

在输入框中输入你的域名：
- 子域名：`docs.mhaibaraai.cn`
- 根域名：`mhaibaraai.cn`
- www 域名：`www.mhaibaraai.cn`

![添加自定义域名](/images/nuxt/vercel-add-domain.png)

::note
**多域名配置建议**

- 可以同时添加根域名和 www 子域名
- Vercel 会自动处理 www 到根域名的重定向
- 推荐配置：`mhaibaraai.cn`（主站）+ `docs.mhaibaraai.cn`（文档站）
::

### 等待域名验证

Vercel 会自动检测 DNS 配置：

- **配置正确**：显示绿色对勾，开始申请 SSL 证书
- **配置错误**：显示红色错误，并提示需要的 DNS 记录

::

## 第四步：验证部署

::steps{level="3"}

### 检查 DNS 解析

使用命令行工具检查 DNS 是否正确解析：

```bash
# 检查子域名
nslookup docs.mhaibaraai.cn

# 检查根域名
nslookup mhaibaraai.cn

# 使用 dig（Linux/macOS）
dig docs.mhaibaraai.cn

# 预期结果应包含
# docs.mhaibaraai.cn CNAME cname.vercel-dns.com
```

### 访问网站

在浏览器中访问：`https://docs.mhaibaraai.cn`

检查项：
- 网站正常加载
- 地址栏显示绿色锁图标（SSL 有效）
- 内容显示正确

### 测试 HTTPS 连接

```bash
# 检查 HTTP 响应头
curl -I https://docs.mhaibaraai.cn

# 预期输出包含
# HTTP/2 200
# server: Vercel
```

::

## 常见问题

### SSL 证书错误

**症状**：访问域名显示 "您的连接不是私密连接"

**解决方案**：
1. 检查 Cloudflare DNS 代理状态是否为 **"仅 DNS"**（灰色云朵）
2. 等待 10-15 分钟让证书生成完成
3. 在 Vercel **Settings** → **Domains** 检查域名状态
4. 如果仍失败，尝试删除域名后重新添加

### DNS 解析不生效

**症状**：域名无法访问或解析到错误的地址

**解决方案**：
1. 确认 DNS 记录类型正确（子域名用 CNAME，根域名用 A 记录）
2. 使用 `nslookup` 或 `dig` 验证 DNS 解析
3. DNS 传播可能需要 24-48 小时，但通常 5-10 分钟即可生效
4. 清除本地 DNS 缓存：`ipconfig /flushdns`（Windows）或 `sudo killall -HUP mDNSResponder`（macOS）

### Vercel 部署失败

**症状**：推送代码后部署失败

**解决方案**：
1. 检查 Vercel 控制台的部署日志
2. 确认 `package.json` 中的构建命令正确
3. 验证环境变量配置完整
4. 检查 Node.js 版本是否兼容（建议使用 LTS 版本）

## 相关资源

::callout{color="primary"}
- [Nuxt 官方文档](https://nuxt.com)
- [Vercel 文档](https://vercel.com/docs)
- [Cloudflare 文档](https://developers.cloudflare.com)
- [Nuxt 部署指南](https://nuxt.com/docs/getting-started/deployment)
::
