---
seo:
  title: YiXuan - 开发随笔
  description: 一个专注于技术分享与知识沉淀的个人网站，从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
ui:
  container: lg:py-20
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
  to: /docs
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
  to: https://github.com/mhaibaraai/mhaibaraai.cn
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

:page-section{class="dark:bg-neutral-950"}
