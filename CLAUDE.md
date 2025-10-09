# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个基于 Nuxt 4 的个人技术博客网站，专注于技术分享与知识沉淀。网站使用 SSR/预渲染模式，支持 PWA 特性，并集成了丰富的现代 Web 开发功能。

## 开发环境

### 前置要求
- Node.js >= 20 < 25
- pnpm 10.18.1

### 常用命令

```bash
# 安装依赖
pnpm i

# 开发环境启动
pnpm dev:prepare
pnpm dev

# 构建生产版本
pnpm build

# 本地预览构建产物
pnpm preview

# 静态导出
pnpm generate

# 代码检查
pnpm lint

# 自动修复代码风格
pnpm lint:fix

# 清理构建与临时产物
pnpm clean
```

## 技术架构

### 核心框架
- **Nuxt 4**: 主框架，使用 SSR/预渲染模式
- **@nuxt/content**: 内容管理系统，支持 Markdown 和 Frontmatter
- **@nuxt/ui**: UI 组件库与排版系统
- **@nuxtjs/seo**: SEO 优化和结构化数据
- **@nuxt/image**: 图片优化
- **motion-v/nuxt**: 动效库
- **nuxt-llms**: 长文档生成与站内搜索

### 内容组织
- 使用 `@nuxt/content` 进行内容管理
- 内容存储在 `content/` 目录
- 支持多种文档类型通过 `content.config.ts` 配置
- 内容结构：
  - `0.ecosystem/`: 生态系统相关文档
  - `1.guides/`: 指南类文档
  - 支持多级目录结构

### 组件架构
- **全局组件**: 位于 `app/components/`
  - `AppHeader.vue`: 网站头部导航
  - `AppFooter.vue`: 网站底部
  - `HeroBackground.vue`: 首页背景动画
- **特定组件**:
  - `components/landing/`: 首页专用组件
  - `components/og-image/`: Open Graph 图片生成
  - `components/theme-picker/`: 主题切换器
- **布局系统**:
  - `app/layouts/docs.vue`: 文档页面布局
  - `app/pages/`: 页面路由

### 配置文件
- **nuxt.config.ts**: Nuxt 主配置
  - 模块配置
  - SEO 设置
  - 结构化数据配置
  - 图片优化
  - 爬虫配置
- **app.config.ts**: 应用配置
  - UI 主题配置
  - 颜色设置
  - 头部/底部配置
  - TOC 配置
- **content.config.ts**: 内容配置
  - 定义内容集合
  - Frontmatter schema 验证
  - SEO 集成

### 开发工具
- **ESLint**: 使用 `@antfu/eslint-config`
- **TypeScript**: 类型安全
- **fast-glob**: 用于构建脚本中的文件匹配

## 内容规范

### Frontmatter 规则
- 仅使用中文内容
- 英文左右添加空格
- 不额外添加一级标题（由 `title` 提供）
- 必须包含完整的 `title` 和 `description`

### Markdown 语法
- 代码块语言标识使用简写（如 `sh`、`ts`）
- 超过 15 行的代码示例应放置在站内文档，不在 README 中展示
- 可使用 `note`、`tip`、`warning`、`caution` 语法，遵循 MDC 书写方式

### 内容组织
- 遵循现有的目录结构
- 使用约定的 schema 进行内容验证
- 支持自定义组件和链接配置

## 关键特性

### SEO 优化
- 自动生成 sitemap 和 robots.txt
- 结构化数据配置
- Open Graph 图片优化
- 自动化的链接检查

### 主题系统
- 深色/浅色主题切换
- 自定义颜色配置
- 响应式设计

### 搜索功能
- 集成 `nuxt-llms` 提供站内搜索
- 支持内容索引和实时搜索

### 部署配置
- 使用 GitHub Actions 自动部署
- 支持 PM2 进程管理（`ecosystem.config.cjs`）
- 静态导出支持

## 开发注意事项

### 代码风格
- 使用 2 空格缩进
- 遵循 ESLint 配置
- TypeScript 严格模式

### 文档更新
- 修改功能后需要同步更新相关文档
- 新增组件需要添加适当注释
- API 变更需要更新相应文档

### 性能优化
- 图片使用 `@nuxt/image` 进行优化
- 代码分割和懒加载
- 预渲染关键页面

### 集成服务
- GitHub 集成：编辑链接、Issue 链接
- 邮件联系
- LLM 服务集成
- 链接检查报告