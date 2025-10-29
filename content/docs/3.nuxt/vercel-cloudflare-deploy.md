---
title: Vercel + Cloudflare 部署
description: 使用 Vercel 和 Cloudflare 部署 Nuxt 项目，绑定自定义域名并实现自动化 CI/CD 流程。
---

## 准备工作

在开始之前，确保你已拥有：

- 一个 Nuxt 项目
- GitHub/GitLab/Bitbucket 账号
- Vercel 账号（可使用 GitHub 登录）
- Cloudflare 账号
- 已在 Cloudflare 托管的域名（如 `mhaibaraai.cn`）

## 第一步：配置 Nuxt 项目

::steps{level="3"}

### 配置 `nuxt.config.ts`

确保项目配置适配 Vercel 部署：

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Vercel 部署预设
  nitro: {
    preset: 'vercel'
  },
  
  // 运行时配置（可选）
  runtimeConfig: {
    // 私有配置（仅服务端可访问）
    apiSecret: '',
    
    // 公共配置（客户端可访问）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || ''
    }
  }
})
```

### 创建 `.vercelignore` 文件（可选）

```text
node_modules
.nuxt
.output
.env
.DS_Store
```

### 推送代码到 Git 仓库

```bash
# 初始化 Git 仓库（如果还未初始化）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "🎉 初始化项目"

# 关联远程仓库
git remote add origin https://github.com/your-username/your-repo.git

# 推送到主分支
git branch -M main
git push -u origin main
```
::

## 第二步：部署到 Vercel

::steps{level="3"}

### 登录 Vercel

::note{to="https://vercel.com"}
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

### 开始部署

点击 **Deploy** 按钮，等待部署完成（通常 1-3 分钟）。部署成功后，Vercel 会分配一个临时域名：`your-project.vercel.app`

::

## 第三步：配置 Cloudflare DNS

::steps{level="3"}

### 登录 Cloudflare

::note{to="https://dash.cloudflare.com"}
访问 Cloudflare Dashboard
::

### 选择域名

在域名列表中选择 `mhaibaraai.cn`

### 添加 DNS 记录

进入 **DNS** → **Records**，添加子域名的 CNAME 记录：

| 类型 | 名称 | 目标 | 代理状态 | TTL |
|------|------|------|----------|-----|
| CNAME | docs | cname.vercel-dns.com | **仅 DNS** | 自动 |

::callout{icon="i-lucide-alert-triangle" color="warning"}
**重要提示**

- 代理状态**必须**设置为 **"仅 DNS"**（灰色云朵图标）
- 如果开启代理（橙色云朵），会导致 SSL 证书验证失败
- 目标地址固定为 `cname.vercel-dns.com`
::

### 保存配置

点击 **Save** 按钮，DNS 记录将在 5-10 分钟内全球生效。

::

## 第四步：绑定自定义域名

::steps{level="3"}

### 进入 Vercel 域名设置

1. 在 Vercel 控制台，进入项目页面
2. 点击 **Settings** → **Domains**

### 添加自定义域名

在输入框中输入：`docs.mhaibaraai.cn`，点击 **Add** 按钮

### 等待域名验证

Vercel 会自动检测 DNS 配置：

- **配置正确**：显示绿色对勾，开始申请 SSL 证书
- **配置错误**：显示红色错误，并提示需要的 DNS 记录

### SSL 证书自动配置

- Vercel 使用 Let's Encrypt 自动申请免费 SSL 证书
- 证书配置时间：5-10 分钟
- 证书自动续期，无需手动操作

::

## 第五步：验证部署

### 检查 DNS 解析

使用命令行工具检查 DNS 是否正确解析：

```bash
# 使用 nslookup
nslookup docs.mhaibaraai.cn

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

## 自动化部署流程

Vercel 已自动配置 CI/CD，无需额外设置。

### 生产部署

推送到 `main` 分支会自动触发生产环境部署：

```bash
git add .
git commit -m "✨ 新增文档章节"
git push origin main
```

部署流程：
1. Vercel 检测到代码推送
2. 自动执行 `npm install` 和 `npm run build`
3. 构建成功后部署到生产环境
4. 自动更新 `docs.mhaibaraai.cn`

### 预览部署

推送到其他分支会生成预览环境：

```bash
git checkout -b feature/new-section
git add .
git commit -m "✨ 添加新章节"
git push origin feature/new-section
```

Vercel 会生成预览链接：`feature-new-section-your-project.vercel.app`

### Pull Request 集成

在 GitHub/GitLab 创建 PR 时：
- Vercel 自动在 PR 评论中添加预览链接
- 每次推送更新都会更新预览环境
- 方便团队协作和代码审查

## 常见问题

### SSL 证书错误

**症状**：访问域名显示 "您的连接不是私密连接"

**解决方案**：
1. 检查 Cloudflare DNS 代理状态是否为 **"仅 DNS"**（灰色云朵）
2. 等待 10-15 分钟让证书生成完成
3. 在 Vercel **Settings** → **Domains** 检查域名状态
4. 如果仍失败，尝试删除域名后重新添加

### 域名无法访问

**症状**：浏览器显示 `DNS_PROBE_FINISHED_NXDOMAIN`

**解决方案**：

清除本地 DNS 缓存：

```bash
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

等待 DNS 记录全球传播（最长 24 小时）。

### 部署失败

**症状**：Vercel 显示 "Build Failed"

**排查步骤**：

查看 Vercel 部署日志，定位错误

检查 `package.json` 中的 `build` 脚本：

```json
{
  "scripts": {
    "build": "nuxt build"
  }
}
```

确认 `nuxt.config.ts` 包含正确的预设：

```typescript
nitro: {
  preset: 'vercel'
}
```

检查依赖是否完整：`npm install`

### API 请求 CORS 错误

**症状**：浏览器控制台显示跨域错误

**解决方案**：

在 `nuxt.config.ts` 中配置路由规则：

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  }
})
```

### 环境变量未生效

**症状**：代码中无法获取环境变量

**解决方案**：

确认在 Vercel **Settings** → **Environment Variables** 中已添加

检查变量名前缀：
- 客户端可访问：`NUXT_PUBLIC_*`
- 仅服务端：不需要前缀

重新部署项目以应用新的环境变量

代码中正确使用：

```typescript
const config = useRuntimeConfig()
console.log(config.public.apiBase)
```

## 高级配置

### 配置多域名

在 Vercel **Settings** → **Domains** 中添加多个域名：

- `docs.mhaibaraai.cn`（主域名）
- `documentation.mhaibaraai.cn`（别名）
- `www.docs.mhaibaraai.cn`（带 www）

所有域名都会指向同一个项目。

### 配置重定向规则

在 `nuxt.config.ts` 中添加路由重定向：

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
    routeRules: {
      // 单个路径重定向
      '/old-path': { redirect: '/new-path' },
      
      // 通配符重定向
      '/old-docs/**': { redirect: '/docs/**' },
      
      // 永久重定向（301）
      '/legacy': { redirect: { to: '/new', statusCode: 301 } }
    }
  }
})
```

### 配置安全头部

增强网站安全性：

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        }
      }
    }
  }
})
```

### 配置 Cloudflare 缓存（可选）

虽然代理已关闭，但仍可配置其他 Cloudflare 功能：

1. 进入 Cloudflare 控制台 → **规则** → **页面规则**
2. 添加规则：`docs.mhaibaraai.cn/*`
3. 设置：
   - 始终使用 HTTPS：开启
   - 自动压缩：Gzip
   - Brotli 压缩：开启

### 自定义 404 页面

创建 `error.vue` 文件：

```vue
<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  error: Object
})
</script>
```

## 部署检查清单

完成以下步骤，确保部署顺利：

- [ ] Nuxt 项目已推送到 Git 仓库（GitHub/GitLab/Bitbucket）
- [ ] 在 Vercel 成功导入并部署项目
- [ ] Vercel 临时域名可正常访问（`*.vercel.app`）
- [ ] 在 Cloudflare 添加 CNAME 记录
- [ ] Cloudflare 代理状态设置为 **"仅 DNS"**（灰色云朵）
- [ ] 在 Vercel 添加自定义域名
- [ ] SSL 证书已成功配置（5-10 分钟）
- [ ] 自定义域名可通过 HTTPS 访问
- [ ] 测试推送代码触发自动部署

## 总结

通过本指南，你已经成功实现：

- **零配置部署**：Vercel 自动识别 Nuxt 框架
- **自动 HTTPS**：免费 SSL 证书，自动续期
- **全球 CDN**：Vercel Edge Network 加速内容分发
- **自动 CI/CD**：Git 推送即触发部署
- **预览环境**：每个分支自动生成预览链接
- **域名管理**：Cloudflare DNS + Vercel 完美结合

**成本说明**：
- Vercel 免费额度：100 GB 带宽/月，足够个人和小型项目使用
- Cloudflare 免费计划：基础 DNS 和安全功能

现在你可以专注于开发内容，部署和运维交给自动化流程！

## 相关资源

- [Nuxt 官方文档](https://nuxt.com)
- [Vercel 文档](https://vercel.com/docs)
- [Cloudflare 文档](https://developers.cloudflare.com)
- [Nuxt 部署指南](https://nuxt.com/docs/getting-started/deployment)
