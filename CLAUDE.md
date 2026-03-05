# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 技术栈

Nuxt 4 + Nuxt Content v3 + `@movk/nuxt-docs`（自定义 Nuxt Layer）+ Nuxt UI v4 + Tailwind CSS v4

运行环境要求：Node.js >= 20.x，pnpm >= 10.x

## 常用命令

```bash
pnpm dev          # 本地开发 (localhost:3000)
pnpm build        # 构建生产版本
pnpm preview      # 预览生产构建
pnpm typecheck    # TypeScript 类型检查
pnpm lint         # ESLint 检查
pnpm lint:fix     # 自动修复 ESLint 问题
pnpm clean        # 清理构建缓存（movk-clean）
```

CI 流水线（`.github/workflows/ci.yml`）仅运行 `lint` 和 `typecheck`，无测试步骤。

## 架构概览

### Nuxt Layer 继承

`nuxt.config.ts` 通过 `extends: ['@movk/nuxt-docs']` 继承上游 Layer，大量功能（布局、组件、模块配置）来自该 Layer 而非本仓库。本地只做差异化覆盖：

- `routeRules`：各文档分类的重定向规则
- `aiChat.model/models`：AI 对话使用的模型列表（通过 OpenRouter）
- `llms`：LLMs.txt 文档索引配置
- `mcp`：MCP Server 配置

### 目录结构

```
app/                    # Nuxt 4 应用目录
  app.config.ts         # UI 主题、导航、AI 问答预设、页脚等运行时配置
  components/           # 本地组件（PageSection.vue）
  composables/          # 本地组合式函数（useHeader.ts）

content/docs/           # Markdown 文档内容
  1.fundamentals/       # 基础知识（编号决定导航顺序）
  2.vue/
  3.nuxt/
  4.java/
  5.guides/
  6.tools/
  7.work-summary/
```

每个目录下的 `.navigation.yml` 控制该分类的导航标题与图标。

### 内容组织规则

- 目录名前缀数字（如 `1.`、`2.`）决定导航顺序，URL 路径中数字前缀会被自动剥离
- `content/index.md` 为网站首页内容
- 文档均为 Markdown，支持 MDC 语法（`@nuxtjs/mdc`）

### ESLint 风格

通过 `@nuxt/eslint` 配置，stylistic 规则：无尾随逗号（`commaDangle: 'never'`），K&R 风格大括号（`braceStyle: '1tbs'`）。
