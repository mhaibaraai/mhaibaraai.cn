---
title: Nuxt SEO
description: Nuxt SEO 实战配置指南
---

## 安装 Nuxt SEO

Nuxt SEO 模块：`@nuxtjs/seo` 集合了多个 SEO 相关的模块，包括：

- [`Robots`](https://nuxt.com/modules/robots)：生成 `robots.txt` 文件，控制搜索引擎爬虫的抓取行为。
- [`Sitemap`](https://nuxt.com/modules/sitemap)：自动生成 `sitemap.xml` 站点地图，支持与 Nuxt Content 集成。
- [`OG Image`](https://nuxt.com/modules/og-image)：动态生成社交媒体分享图片，用于微信、Twitter 等平台预览。
- [`Schema.Org`](https://nuxt.com/modules/schema-org)：注入 Schema.org 结构化数据，帮助搜索引擎理解页面内容。
- [`Link Checker`](https://nuxt.com/modules/link-checker)：构建时检查并报告网站中的死链。
- [`SEO Utils`](https://nuxtseo.com/docs/seo-utils/getting-started/introduction)：提供一些实用的 SEO 工具函数，例如 `findPageHeadline` 用于从导航数据中提取页面标题。

::note{to="https://nuxtseo.com/docs/nuxt-seo/getting-started/installation"}
详见 `@nuxtjs/seo` 官方安装文档。
::

## 建立站点元数据中心

在 `nuxt.config.ts` 中引入新的顶层 `site` 配置块。这是 `@nuxtjs/seo` 的基石。

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules#shared-configuration"}
Nuxt SEO 站点配置
::

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  site: {
    url: 'https://mhaibaraai.cn',
    name: 'YiXuan 的开发随笔',
    logo: '/avatar.png',
    description: '一个专注于技术分享与知识沉淀的个人网站。'
  }
})
```

::tip
`trailingSlash: true` 将 URL 统一为以斜杠(`/`)结尾，避免搜索引擎因视 `/page` 与 `/page/` 为不同页面而产生重复内容问题，从而集中页面权重。
::

## Nuxt Content 集成

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules#nuxt-content-integration"}
Nuxt SEO 与 Nuxt Content 集成
::

```ts [content.config.ts]
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'index.md',
      }),
    ),
    docs: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: '**',
          exclude: ['index.md'],
        },
      }),
    ),
  },
})
```

## 配置 Robots

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/robots/getting-started/introduction"}
配置 Robots 模块
::

```ts [nuxt.config.ts]
import packageJson from './package.json'

defineNuxtConfig({
  robots: {
    sitemap: `${packageJson.homepage}/sitemap.xml`, // 指向你的站点地图
  },
})
```

## 配置 Sitemap

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/sitemap/getting-started/introduction"}
配置 Sitemap 模块
::

示例：更改列数并添加优先级和 **changeFreq** 字段

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  sitemap: {
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Priority', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Change Frequency', select: 'sitemap:changefreq', width: '12.5%' },
    ],
  },
})
```

::tip{icon="i-lucide-bookmark" to="https://nuxt.com/docs/4.x/getting-started/prerendering#selective-pre-rendering"}
你可以结合 `crawlLinks` 选项来预渲染一些爬虫无法发现的路由，比如你的 `/sitemap.xml` 或 `/robots.txt`。

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // https://nitro.build/config
  nitro: {
    prerender: {
      routes: ['/', '/sitemap.xml', '/robots.txt'],
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
  },
})
```
::

## 配置 OG Image

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/og-image/getting-started/introduction"}
配置 OG Image 模块
::

::warning{to="https://nuxtseo.com/docs/og-image/guides/non-english-locales"}
中文网站需要配置字体，否则会显示乱码。
::

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  ogImage: {
    zeroRuntime: true,
    googleFontMirror: 'fonts.loli.net',
    fonts: [
      // 思源黑体 - 支持中文
      'Noto+Sans+SC:400',
      'Noto+Sans+SC:500',
      'Noto+Sans+SC:700',
      // 如果需要英文字体
      'Inter:400',
      'Inter:700'
    ]
  }
})
```

[![og](https://mhaibaraai.cn/__og-image__/static/og.png)](https://mhaibaraai.cn/)

## 配置 Link Checker

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/link-checker/getting-started/introduction"}
配置 Link Checker 模块
::

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  linkChecker: {
    // 配置报告输出
    report: {
      publish: true, // 是否发布报告
      html: true,
      markdown: true,
      json: true,
    },
  },
})
```

## 配置 Schema.Org

::callout{icon="i-lucide-bookmark" to="https://nuxtseo.com/docs/schema-org/getting-started/introduction"}
配置 Schema.Org 模块
::

当您的网站是关于个人、个人品牌或个人博客时，应使用 `Person` 身份。

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  schemaOrg: {
    identity: definePerson({
      name: 'YiXuan',
      image: '/avatar.png',
      url: 'https://mhaibaraai.cn',
      description: '一个专注于技术分享与知识沉淀的个人网站。',
      email: 'mhaibaraai@gmail.com',
      sameAs: [
        'https://github.com/mhaibaraai',
      ],
    }),
  },
})
```
