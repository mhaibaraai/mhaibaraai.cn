[![og](https://mhaibaraai.cn/og-image.png)](https://mhaibaraai.cn/)

> YiXuan 的开发随笔：技术笔记、书签、配置与项目。

[![Version][version-src]][version-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

## 栏目

| 路由 | 内容 |
| --- | --- |
| `/docs` | 技术笔记：前端基础、Vue、Nuxt、Java、实践指南、工具集、工作总结 |
| `/bookmarks` | 按分类整理的常用站点 |
| `/start` | 浏览器起始页（Chrome 扩展 / Safari 主页） |
| `/config` | Surge、Quantumult X 脱敏模板与规则集，Dotfiles |
| `/projects` | 开源项目与 GitHub 贡献热力图 |
| `/now`、`/uses`、`/shelf`、`/friends`、`/guestbook` | 此刻、装备、书影音、友链、留言板 |

订阅：[RSS](https://mhaibaraai.cn/rss.xml) · [llms.txt](https://mhaibaraai.cn/llms.txt) · [llms-full.txt](https://mhaibaraai.cn/llms-full.txt)

## 技术栈

Nuxt 4 · Nuxt UI 4 · Nuxt Content 3 · Tailwind CSS 4 · motion-v

## 本地开发

需要 Node.js >= 22.x 和 pnpm >= 10.x：

```bash
pnpm install
pnpm dev
```

```bash
pnpm lint          # ESLint + 代理配置敏感信息扫描
pnpm typecheck
pnpm test          # 单元测试
pnpm build && pnpm test:e2e
```

Chrome 新标签页扩展见 [extensions/newtab](./extensions/newtab/README.md)。

## License

[MIT](./LICENSE) License © 2024-PRESENT [YiXuan](https://github.com/mhaibaraai)

<!-- Badges -->

[version-src]: https://img.shields.io/github/package-json/v/mhaibaraai/mhaibaraai.cn?style=flat&colorA=080f12&colorB=d64b34
[version-href]: https://github.com/mhaibaraai/mhaibaraai.cn
[license-src]: https://img.shields.io/github/license/mhaibaraai/mhaibaraai.cn.svg?style=flat&colorA=080f12&colorB=d64b34
[license-href]: https://github.com/mhaibaraai/mhaibaraai.cn/blob/main/LICENSE
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
