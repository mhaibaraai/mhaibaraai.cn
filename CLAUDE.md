# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

mhaibaraai.cn - 个人技术博客/知识沉淀网站，基于 Nuxt 4 + Nuxt Content + Nuxt UI + Tailwind CSS 4 构建。

## Commands

```bash
pnpm dev          # 启动开发服务器 (localhost:3000)
pnpm build        # 生产构建
pnpm preview      # 预览生产构建
pnpm typecheck    # TypeScript 类型检查
pnpm lint         # ESLint 检查
pnpm lint:fix     # ESLint 自动修复
pnpm clean        # 清理 .nuxt 等缓存目录
```

CI 流程（push main / PR to main）执行：lint + typecheck。

## Architecture

### 主题继承

项目继承 `@movk/nuxt-docs` 主题层（在 `nuxt.config.ts` 中通过 `extends` 配置），该主题提供文档布局、AI Chat、MCP 端点、LLMs.txt 等核心功能。本项目主要负责内容编写和配置覆盖。

### 目录结构

- `app/` - Nuxt 应用代码（组件、composables、配置）
- `content/docs/` - 全部文档内容（Markdown），按数字前缀排序分类
- `nuxt.config.ts` - 框架配置（路由重定向、AI Chat 模型、ESLint 规则、LLMs 元数据）
- `app/app.config.ts` - 运行时 UI 配置（主题色、代码块图标映射、AI Chat FAQ、页脚）

### 内容组织

文档位于 `content/docs/` 下，共 7 个一级分类（fundamentals、vue、nuxt、java、guides、tools、work-summary），使用数字前缀控制导航排序。每个目录有 `.navigation.yml` 配置导航标题和图标。

新增文档分类时需同步更新：
1. `nuxt.config.ts` 中 `routeRules` 的重定向规则
2. `app/composables/useHeader.ts` 中的移动端导航链接

### 自定义代码

项目自定义代码量很小：
- `app/composables/useHeader.ts` - 桌面端/移动端导航链接配置
- `app/components/PageSection.vue` - 首页快速查阅区域组件

## Code Style

- **ESLint 风格**：禁止末尾逗号（`commaDangle: 'never'`），1TBS 大括号风格
- **Vue 属性**：单行最多 5 个属性，多行每行 1 个
- **不使用 Prettier**：代码格式化完全依赖 ESLint
- **缩进**：2 空格，LF 换行符

## Environment Variables

参考 `.env.example`：
- `NUXT_GITHUB_TOKEN` - GitHub 令牌（获取文档内容）
- `AI_GATEWAY_API_KEY` - AI Gateway API 密钥
