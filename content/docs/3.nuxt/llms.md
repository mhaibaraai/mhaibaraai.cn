---
title: Nuxt LLMs
description: 使用 nuxt-llms 生成 /llms.txt，并规范化站内链接以便 LLM 抓取。
---

## 最小配置

::note{to="https://nuxt.com/modules/llms"}
`nuxt-llms` 自动生成 `llms.txt`，用于向 LLM 提供结构化站点说明，可选启用 `llms-full.txt`。
::

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-llms'],
  llms: {
    domain: 'https://mhaibaraai.cn',
    title: 'YiXuan 的开发随笔',
    description: '一个专注于技术分享与知识沉淀的个人网站。',
  },
})
```

## 链接规范化（LLM 友好）

为保证 LLM 获取「可直接抓取的 Markdown 原文」，在服务端 Hook 中将站内链接重写为 `/raw...[slug].md`：

```ts [server/plugins/llms.ts]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate', (_, { sections }) => {
    sections.forEach((s) => {
      if (!s.links) return
      s.links = s.links.map((l) => ({
        ...l,
        href: `${l.href.replace(/^https:\/\/mhaibaraai.cn/, 'https://mhaibaraai.cn/raw')}.md`,
      }))
    })
  })
})
```

::tip
仅转换本站链接，避免误改外域；本地与生产的域名前缀需一致或做条件处理。
::
