# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
pnpm install      # 首次安装依赖（需要配置 NUXT_GITHUB_TOKEN，见下文）
```

```bash
pnpm dev          # 启动开发服务器（http://localhost:3000）
pnpm build        # 构建生产版本
pnpm preview      # 预览生产构建
pnpm typecheck    # TypeScript 类型检查
pnpm lint         # ESLint 检查
pnpm lint:fix     # ESLint 自动修复
pnpm clean        # 清理构建缓存（.nuxt、.output、node_modules/.cache）
```

运行要求：Node.js >= 20.x，pnpm >= 10.x。

## 架构概述

这是一个基于 **Nuxt Layer 继承** 的个人技术博客站点。

### 核心设计：Layer 继承

`nuxt.config.ts` 中 `extends: ['@movk/nuxt-docs']` 是理解整个项目的关键。绝大多数页面、布局、组件和配置都来自 `@movk/nuxt-docs` 基础层，本仓库只负责：

1. **内容**：`content/` 目录下的 Markdown 文件
2. **覆盖**：`app/` 目录下少量的组件和 composable
3. **配置**：`nuxt.config.ts` 中的路由规则、AI Chat 模型、LLMs 配置

### 目录结构

```
app/
  components/
    PageSection.vue   # 首页「快速查阅」区块，注入 navigation 数据
  composables/
    useHeader.ts      # 导航栏链接配置（桌面端/移动端）
  app.config.ts       # 站点配置（AI FAQ、颜色主题、页脚、TOC 链接）

content/
  index.md            # 首页（MDC 语法）
  docs/               # 技术笔记，按数字前缀排序
    1.fundamentals/   # 前端基础（Async/Await、CSS、TS 等）
    2.vue/            # Vue 生态
    3.nuxt/           # Nuxt 框架
    4.java/           # Java 开发
    5.guides/         # 实践指南（部署、平台集成）
    6.tools/          # 开发工具
    7.work-summary/   # 年度工作总结
```

### 内容编写规范

- 文件格式：MDC（Markdown Components），支持嵌入 Vue 组件
- 导航排序：目录和文件名的数字前缀决定导航顺序
- **新增分类时**：在 `content/docs/` 下创建目录后，**必须同步**在 `nuxt.config.ts` 的 `routeRules` 中添加对应的重定向规则，否则访问分类根路径会返回 404

### 部署

推送到 `main` 分支后，GitHub Actions 自动构建 Docker 镜像并推送到 GHCR（`ghcr.io/mhaibaraai/mhaibaraai.cn`）。

构建时需要两个 secret：
- `NUXT_GITHUB_TOKEN`：用于访问私有 npm 包
- `AI_GATEWAY_API_KEY`：用于 AI Chat 功能

### 关键配置位置

| 配置项 | 位置 |
|--------|------|
| AI Chat 模型列表 | `nuxt.config.ts` → `aiChat.models` |
| LLMs.txt 内容 | `nuxt.config.ts` → `llms` |
| 站点颜色主题 | `app/app.config.ts` → `ui.colors` |
| AI Chat FAQ 预设问题 | `app/app.config.ts` → `aiChat.faqQuestions` |
| 导航链接 | `app/composables/useHeader.ts` |
| 新增文档分类时的默认重定向 | `nuxt.config.ts` → `routeRules` |
