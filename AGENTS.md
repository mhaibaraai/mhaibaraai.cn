# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## 项目概述

这是一个基于 Nuxt 4 的个人技术博客网站,使用 `@movk/nuxt-docs` 主题构建。项目专注于技术文档与知识分享,并针对 AI 进行了优化(提供 llms.txt 索引)。

## 核心架构

### 主题扩展模式

项目通过 Nuxt 的 `extends` 功能扩展 `@movk/nuxt-docs` 主题:

```typescript
// nuxt.config.ts
extends: ['@movk/nuxt-docs']
```

**关键影响**:
- 大部分 UI 组件、布局和功能由主题提供
- 项目代码仅包含自定义配置和覆盖
- 修改主题功能时,优先在 `app/` 目录下创建同名文件覆盖
- 查看主题源码: `node_modules/@movk/nuxt-docs/`

### 目录结构说明

```
app/
  ├── app.config.ts        # 应用配置(UI 主题、页脚等)
  ├── assets/css/          # 自定义样式
  ├── components/          # 覆盖或扩展主题组件
  └── composables/         # 自定义 composables

content/
  ├── index.md             # 首页内容
  └── docs/                # 文档内容,使用数字前缀控制顺序
      ├── 1.fundamentals/  # 基础知识
      ├── 2.vue/           # Vue 相关
      ├── 3.nuxt/          # Nuxt 相关
      ├── 4.java/          # Java 开发
      ├── 5.guides/        # 操作指南
      └── 6.tools/         # 开发工具
```

**数字前缀约定**: content/docs 子目录使用数字前缀(1., 2., 3. ...)控制导航顺序

### 配置文件分离

- `nuxt.config.ts`: 模块配置、路由规则、SEO、AI 集成等
- `app/app.config.ts`: 运行时配置,如 UI 主题色、页脚内容等

## 常用命令

### 开发构建

```bash
pnpm dev          # 启动开发服务器 (http://localhost:3000)
pnpm build        # 构建生产版本
pnpm preview      # 本地预览生产构建
```

### 代码质量

```bash
pnpm typecheck    # TypeScript 类型检查
pnpm lint         # ESLint 代码检查
pnpm lint:fix     # 自动修复 lint 问题
```

### 维护清理

```bash
pnpm clean        # 清理构建缓存 (使用 @movk/core 工具)
pnpm up           # 更新依赖
```

## 环境变量

项目使用以下环境变量(参考 `.env.example`):

```bash
NUXT_GITHUB_TOKEN=        # 用于获取文档内容
AI_GATEWAY_API_KEY=       # AI Gateway 服务密钥
OPENROUTER_API_KEY=       # OpenRouter 服务密钥(可替代 AI Gateway)
```

**注意**: 这些密钥已在 `.gitignore` 中排除,切勿提交

## 内容编写规范

### 文档格式

所有文档使用 Markdown(基于 Nuxt Content):

```markdown
---
seo:
  title: 页面标题
  description: 页面描述
---

# 文档标题

内容...
```

### 特殊组件

主题提供的自定义组件(可在 Markdown 中使用):

- `::u-page-hero` - 页面顶部 Hero 区域
- `::motion` - 动画效果包装器
- `:page-section` - 页面分区

查看 `content/index.md` 了解使用示例。

## 路由配置

项目在 `nuxt.config.ts` 中定义了大量重定向规则,确保分类页面重定向到默认子页面:

```typescript
routeRules: {
  '/docs': { redirect: '/docs/fundamentals', prerender: false },
  '/docs/fundamentals': { redirect: '/docs/fundamentals/async-await', prerender: false },
  // ...
}
```

**添加新分类时**: 记得添加对应的重定向规则

## AI 功能集成

### AI Chat

配置在 `nuxt.config.ts` 的 `aiChat` 选项中,支持多个模型:

- `mistral/devstral-2` (默认)
- `kwaipilot/kat-coder-pro-v1`
- 等...

### LLMs 索引

配置在 `llms` 选项中,自动生成 `/llms.txt` 和 `/_llms-full.txt` 索引文件,方便 AI 助手理解站点结构。

## 工具依赖

### 包管理器

项目强制使用 pnpm >= 10.27.0:

```json
"packageManager": "pnpm@10.27.0"
```

### @movk/core

项目使用 `@movk/core` 提供的工具简化构建流程,如 `movk-clean` 命令。优先使用 `@movk/core` 工具而非自定义脚本。

## 样式与 UI

- 主题色: `sky` (配置在 `app/app.config.ts`)
- 图标库: `@iconify-json/ri`, `@iconify-json/tabler`
- CSS: Tailwind CSS 4 + 自定义样式(`app/assets/css/main.css`)

## 部署相关

### Vercel Analytics

在 `app/app.config.ts` 中启用:

```typescript
vercelAnalytics: {
  enable: true,
  debug: false
}
```

### SEO 与结构化数据

- 使用 `nuxt-schema-org` 定义个人信息
- 配置 robots.txt 和 sitemap
- 参考 `nuxt.config.ts` 的 `schemaOrg` 和 `robots` 配置

## 技术栈参考

- **框架**: Nuxt 4
- **内容管理**: Nuxt Content
- **主题**: @movk/nuxt-docs
- **UI 库**: Nuxt UI + Tailwind CSS 4
- **Node 版本**: >= 20.x
