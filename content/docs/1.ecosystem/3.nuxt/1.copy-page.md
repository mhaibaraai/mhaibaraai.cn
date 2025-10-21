---
title: Copy Page
description: 为用户与 LLM 提供「干净的 Markdown 原文」，可直接复制或在新标签页查看。
---

## 路由

- 路径：`/raw/[...slug].md`
- 返回：`text/markdown; charset=utf-8`
- 行为：基于 `@nuxt/content` 查询页面，缺少 H1/描述时自动注入，再用 `minimark/stringify` 输出为 Markdown。

::note{to="https://github.com/nuxt/ui/blob/a32cc37f7392499ab02558e4d58b46195f7ffad4/docs/server/routes/raw/%5B...slug%5D.md.get.ts"}
服务器端实现 `server/routes/raw/[...slug].md.get.ts` 参考了 Nuxt UI 文档站的同名路由实现（思想与结构），以适配本项目需求。
::

### 关键点（精简）

- 仅处理以 `.md` 结尾的请求；非 `.md` 返回 404。
- 通过 `queryCollection('docs').path(route)` 查询对应文档。
- 统一输出为 Markdown，便于复制、下载与 LLM 抓取。

```ts [server/routes/raw/[...slug].md.get.ts]
// 仅示意关键步骤
setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
return stringify({ ...page.body, type: 'minimark' }, { format: 'markdown/html' })
```

## 页面工具（PageHeaderLinks）

`app/components/PageHeaderLinks.vue` 提供便捷入口：

- **Copy page**：复制当前文档的 Markdown 原文
- **View as Markdown**：在新标签页打开 `/raw...[slug].md`
- **Open in ChatGPT / Claude**：以提示语引导模型抓取原文链接

```ts [app/components/PageHeaderLinks.vue]
// 复制当前文档原文（调用 /raw 路由）
async function copyPage() {
  copy(await $fetch<string>(`/raw${route.path}.md`))
}
```

## 使用建议

- 站内引用原文时，优先使用 `/raw... .md`，提升跨工具可读性。
- 若需禁止被搜索引擎索引，请结合 Robots 策略按需处理。

::tip{to="/docs/ecosystem/nuxt-llms"}
结合 LLM 链接规范化使用。
::
