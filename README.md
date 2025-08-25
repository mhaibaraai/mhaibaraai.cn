---
title: mhaibaraai.cn
description: 一个专注于技术分享与知识沉淀的个人网站
---

[![Deploy][deploy-src]][deploy-href]
[![Pnpm][pnpm-src]][pnpm-href]
[![Node.js][node-src]][node-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

### 简介

一个专注于技术分享与知识沉淀的个人网站，域名 `https://mhaibaraai.cn` 。

### 截图

![首页截图](./public/images/readme/homepage.png)

### 技术栈

- Nuxt 4（SSR / 预渲染）
- @nuxt/content（内容管理）
- @nuxt/ui（组件与排版）
- @nuxtjs/seo（站点与结构化数据）
- @nuxt/image（图片优化）
- @vueuse/nuxt（组合式工具集）
- motion-v / nuxt（动效）
- nuxt-llms（长文档生成与站内搜索）

### 本地开发

- 前置要求：Node >= 20 < 25、使用 pnpm（推荐 `curl -fsSL https://get.pnpm.io/install.sh | sh -` 安装）

```sh
pnpm i
pnpm dev:prepare
pnpm dev
```

- 默认开发地址：`http://localhost:3000/`
- 可选命令：
  - `pnpm lint`：代码检查
  - `pnpm lint:fix`：自动修复
  - `pnpm clean`：清理构建与临时产物
  - `pnpm generate`：静态导出
  - `pnpm preview`：本地预览构建产物

### 内容规范

- 仅中文；英文左右添加空格；不额外添加一级标题（由 `title` 提供）。
- 使用 Frontmatter（`---` 分隔），`title` 与 `description` 填写完整。
- 代码块语言标识使用简写（如 `sh`、`ts`）。
- 超过 15 行的代码示例不在 README 展示（放置于站内文档）。
- 可使用 `note`、`tip`、`warning`、`caution` 语法时遵循 MDC 书写方式；为保证 GitHub 可读性，酌情使用。

### 致谢与许可

- 致谢 Nuxt 生态与相关开源项目。
- 本项目使用 MIT 许可证，详见 [`LICENSE`](./LICENSE)。

<!-- Badges -->
[deploy-src]: https://github.com/mhaibaraai/mhaibaraai.cn/actions/workflows/deploy.yml/badge.svg?branch=main
[deploy-href]: https://github.com/mhaibaraai/mhaibaraai.cn/actions/workflows/deploy.yml

[pnpm-src]: https://img.shields.io/badge/pnpm-10.15.0-F69220?logo=pnpm&logoColor=fff
[pnpm-href]: https://pnpm.io

[node-src]: https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=fff
[node-href]: https://nodejs.org

[license-src]: https://img.shields.io/badge/License-MIT-blue.svg
[license-href]: https://github.com/mhaibaraai/mhaibaraai.cn/blob/main/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=fff
[nuxt-href]: https://nuxt.com
