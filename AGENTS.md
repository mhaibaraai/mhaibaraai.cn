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

运行要求：Node.js >= 22.x（Content 使用 native sqlite），pnpm >= 10.x。

## 架构概述

自研的杂志编辑风个人站，基于 Nuxt 4 + Nuxt UI 4 + Nuxt Content 3，不再继承任何 docs layer。

### 目录结构

```text
app/
  app.vue                 # UApp、MotionConfig、全站 ⌘K 搜索、注入 docs 导航（provide('navigation')）
  app.config.ts           # 站点信息、导航（nav/navMore）、社交链接、Giscus、主题色
  assets/css/main.css     # 设计 token（纸张底色、朱红主色、字体）、首字下沉、阅读进度、reduced-motion
  layouts/                # default（页头页脚）、docs（左侧目录）、blank（起始页）
  components/
    site/                 # 页头、页脚
    home/                 # 首页各区块与 Canvas 背景
    motion/               # RevealText（逐字遮罩）、Reveal（滚动入场）
    page/Masthead.vue     # 各页统一刊头
    content/              # Markdown 中可用的组件：ProxyImport、RuleSetTable
  pages/                  # 首页、docs、bookmarks、start、config、projects、uses、now、shelf、friends、guestbook
  utils/                  # 纯函数（issue、reading、navigation、search-engines、proxy-links、rule-sets）
shared/
  schemas/                # 内容集合的 zod schema
  utils/                  # 前后端共用：书签过滤、规则集转换、llms 文档生成
server/
  api/github/             # 仓库 star、贡献热力图（需 NUXT_GITHUB_TOKEN）
  routes/                 # rss.xml、api/bookmarks.json、proxy/rules/[client]/[file]
  plugins/llms.ts         # 生成 llms.txt / llms-full.txt（取代 Content 内置集成）
  assets/rules/*.list     # 规则集唯一来源（Surge 语法）
modules/content-git-date.ts # 构建时为 docs/config 注入 git 最后更新时间
public/proxy/             # Surge / Quantumult X 脱敏模板
extensions/newtab/        # Chrome 新标签页扩展（内嵌 /start，离线兜底）
scripts/check-proxy-secrets.ts
content/
  docs/                   # 技术笔记，数字前缀决定导航顺序
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

- `@nuxt/content` 的 `llms` 集成已关闭（其 stringifyMarkdown 在部分笔记上栈溢出），由 `server/plugins/llms.ts` 用 `rawbody` 生成
- `/start` 响应头允许 `chrome-extension:` 内嵌，且 noindex
- 模板中 `:to` 等绑定避免直接写含 `${}` 的模板字符串，vue-tsc 会丢失 v-for 作用域，改用函数
- 所有动效需兼容 `prefers-reduced-motion`

### 关键配置位置

| 配置项 | 位置 |
|--------|------|
| 导航、社交链接、Giscus | `app/app.config.ts` |
| 主题色与字体 | `app/assets/css/main.css`、`app/app.config.ts` → `ui.colors` |
| 内容集合 schema | `content.config.ts`、`shared/schemas/` |
| LLMs.txt 标题描述 | `nuxt.config.ts` → `llms` |
| 分类默认重定向 | `nuxt.config.ts` → `routeRules` |
