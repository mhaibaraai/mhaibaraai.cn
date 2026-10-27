# AGENTS.md

This file provides guidance for AI coding agents working on this repository.

## 常用命令

```bash
pnpm install      # 安装依赖（可选配置 NUXT_GITHUB_TOKEN，见 .env.example）
pnpm dev          # 启动开发服务器（http://localhost:3000）
pnpm build        # 构建生产版本
pnpm preview      # 预览生产构建
pnpm typecheck    # TypeScript 类型检查
pnpm lint         # ESLint + 代理配置敏感信息扫描（check:proxy）
pnpm lint:fix     # ESLint 自动修复
pnpm test         # vitest 单元测试（test/unit）
pnpm test:coverage
pnpm test:e2e     # Playwright E2E（需先 pnpm build）
pnpm check:proxy  # 单独运行敏感信息扫描
```

运行要求：Node.js >= 22.5（Content 使用 node:sqlite），pnpm >= 10.x。

## 架构概述

杂志编辑风个人站，基于 Nuxt 4 + Nuxt UI 4 + Nuxt Content 3，通过 `extends: ['@movk/nuxt-docs']` 继承 v3 Layer。

### Layer 与站点的分工

- **Layer 提供**：`/docs/**` 文档页与 `docs` 集合、页头外壳（搜索、主题面板、颜色模式、文档栏目条）、文档侧栏与目录、⌘K 搜索、SEO 与 OG 图片、sitemap / robots、`llms.txt` / `llms-full.txt`、`/raw/**.md`、MCP Server、`/.well-known/*` 代理发现，以及字体、vermilion / paper 配色与 `kicker`、`rule`、`link-wipe` 等工具类
- **站点自有**：首页（`app/pages/index.vue` 覆盖 layer 首页）、书签、起始页、配置中心、项目、Now / Uses / 书影音 / 友链 / 留言板（Giscus）、RSS、代理规则集与模板
- 覆盖 layer 组件只使用其[覆盖契约](https://docs.mhaibaraai.cn/docs/guide/customization)中列出的组件；当前覆盖 `HeaderCenter`（主导航 + 更多）与 `Footer`
- AI Chat 已显式关闭（`aiChat.enabled: false`），开启需安装其可选依赖

### 目录结构

```text
app/
  app.config.ts           # layer 配置（header.nav、seo、toc、github）与站点配置（nav/navMore、socials、Giscus）
  assets/css/main.css     # 并入 layer 的 Tailwind 根：仅放中文衬线字体与站点独有样式，不要 @import "tailwindcss"
  error.vue               # 自定义 404，复用 layer 的 useDocsShell
  plugins/og-image.ts     # 非文档页回退到 /og-image.png
  components/
    HeaderCenter.vue      # 覆盖 layer 主导航
    Footer.vue            # 覆盖 layer 页脚
    home/                 # 首页各区块与 Canvas 背景
    motion/               # RevealText（逐字遮罩）、Reveal（滚动入场）
    page/Masthead.vue     # 各页统一刊头
    content/              # Markdown 中可用的组件：ProxyImport、RuleSetTable
  pages/                  # 首页、bookmarks、start、config、projects、uses、now、shelf、friends、guestbook
  utils/                  # 纯函数（issue、navigation、search-engines、proxy-links、rule-sets）
shared/
  schemas/                # 站点集合的 zod schema
  utils/                  # 前后端共用：书签过滤、规则集转换、笔记日期排序
server/
  api/github/             # 仓库 star、贡献热力图（需 NUXT_GITHUB_TOKEN）
  routes/                 # rss.xml、api/bookmarks.json、proxy/rules/[client]/[file]
  assets/rules/*.list     # 规则集唯一来源（Surge 语法）
modules/content-git-date.ts # 构建时注入 git 最后更新时间：config 写入 date，docs 写入 meta.date
public/proxy/             # Surge / Quantumult X 脱敏模板
extensions/newtab/        # Chrome 新标签页扩展（内嵌 /start，离线兜底）
scripts/check-proxy-secrets.ts
content/
  docs/                   # 技术笔记（layer 的 docs 集合），数字前缀决定导航顺序
  config/                 # 配置中心页面
  bookmarks/*.yml         # 书签，一个文件一个分类
  now.md、uses.yml、projects.yml、shelf.yml、friends.yml
```

### 内容编写规范

- 笔记为 MDC 格式，可使用 Nuxt UI Prose 组件（note、tip、steps、code-group 等）
- **新增笔记分类时**：在 `content/docs/` 下创建目录后，**必须同步**在 `nuxt.config.ts` 的 `routeRules` 中添加重定向，否则访问分类根路径会 404
- 书签 `unlisted: true` 仅在 `/start` 显示，但仍可通过公开 URL 访问，不要放敏感地址
- 代理配置只能提交脱敏内容，订阅地址用 `YOUR_SUBSCRIPTION_URL` 等占位符；私有配置放在已忽略的 `proxy-private/`
- 新增规则集：在 `server/assets/rules/` 添加 `.list`，并登记到 `app/utils/rule-sets.ts`

### 关键约束

- `docs` 集合由 layer 定义，不要在 `content.config.ts` 中重复声明；笔记更新时间读 `meta.date`（`shared/utils/notes.ts`），无法在查询中按日期排序
- 页面标题模板来自 `app.config.ts` → `seo.titleTemplate`；首页以 `titleTemplate: '%s'` 只显示站点名
- `/start` 响应头允许 `chrome-extension:` 内嵌，且 noindex
- 模板中 `:to` 等绑定避免直接写含 `${}` 的模板字符串，vue-tsc 会丢失 v-for 作用域，改用函数
- 所有动效需兼容 `prefers-reduced-motion`

### 关键配置位置

| 配置项 | 位置 |
|--------|------|
| 导航、社交链接、Giscus、SEO 标题 | `app/app.config.ts` |
| 主题色与字体 | 沿用 layer 默认；如需调整用 `app/app.config.ts` → `ui.colors` / `theme` |
| 站点集合 schema | `content.config.ts`、`shared/schemas/` |
| LLMs.txt 标题描述 | `nuxt.config.ts` → `llms` |
| 分类默认重定向 | `nuxt.config.ts` → `routeRules` |
