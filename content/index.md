---
seo:
  title: YiXuan - 开发随笔
  description: 一个专注于技术分享与知识沉淀的个人网站，从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
:::motion
👋 开发随笔
:::

#description
:::motion
---
transition: { duration: 0.6, delay: 0.3 }
---
从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。
:::

#links
:::motion{class="flex flex-wrap gap-x-6 gap-y-3"}
---
transition: { duration: 0.6, delay: 0.5 }
---
  ::::u-button
  ---
  to: /docs/getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  阅读更多
  ::::

  ::::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: outline
  size: xl
  to: https://github.com/mhaibaraai/movk-nuxt-docs
  target: _blank
  ---
  Star on GitHub
  ::::
:::

#default
:::motion
---
transition: { duration: 0.6, delay: 0.1 }
---
<NuxtImg src="/i-llustration.png" alt="Illustration" width="400" class="rounded-lg shadow-2xl ring ring-default mx-auto" />
:::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
快速查阅

#features
  :::u-page-feature
  ---
  icon: i-lucide-folder-code
  ---
  #title
  语言与生态

  #description
  按语言、框架与工具分类整理，聚焦实践要点与可复用知识。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-rocket
  ---
  #title
  实践指南

  #description
  从环境部署到平台开发的实践指南。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-wrench
  ---
  #title
  工具集

  #description
  开发过程中常用工具的配置和使用指南。
  :::
::
