---
title: Nuxt UI (Vue + UnoCSS)
description: 在 Vue + Vite 项目中使用 UnoCSS 替代 Tailwind CSS 集成 Nuxt UI 组件库。
---

## 为什么选择 Nuxt UI

[Nuxt UI](https://ui.nuxt.com) v4 是一个基于 Reka UI（原 Radix Vue）构建的高质量 Vue 组件库，提供统一的设计系统、内置 light/dark 模式和灵活的主题定制能力。

::callout{icon="i-lucide-info"}
Nuxt UI 官方依赖 Tailwind CSS，但通过社区方案 [unocss-preset-nuxt-ui](https://github.com/lehuuphuc/unocss-preset-nuxt-ui)，可以在 UnoCSS 项目中直接使用 Nuxt UI，无需引入 Tailwind CSS。
::

选择 Nuxt UI 的理由：

- **无障碍支持**：基于 Reka UI，a11y 开箱即用
- **设计系统**：CSS 变量主题令牌，与 UnoCSS 体系无缝衔接
- **Vite 原生**：提供 `@nuxt/ui/vite` 插件，无需 Nuxt 框架
- **自动导入**：组件和 composables 零配置自动导入

## 依赖安装

```sh [sh]
pnpm add @nuxt/ui unocss-preset-nuxt-ui
```

| 包名 | 用途 |
| --- | --- |
| `@nuxt/ui` | Nuxt UI 组件库 |
| `unocss-preset-nuxt-ui` | UnoCSS 预设，替代 Tailwind CSS 提供 Nuxt UI 所需样式 |

## Vite 插件配置

引入 `@nuxt/ui/vite` 插件，它内部集成了 `unplugin-auto-import` 和 `unplugin-vue-components`：

```ts [vite.config.ts]
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    ui({
      // 自动导入 Vue、VueUse 等 API
      autoImport: {
        imports: ['vue', '@vueuse/core', 'vue-router'],
      },
      // 主题默认变量
      theme: {
        defaultVariants: {
          size: 'md',
          color: 'primary',
        },
      },
    }),
  ],
})
```

::warning
`@nuxt/ui/vite` 内部已集成 `unplugin-auto-import` 和 `unplugin-vue-components`。如果项目中原先单独配置了这两个插件，需要将配置合并到 `ui()` 的 `autoImport` 和 `components` 选项中，避免重复注册。
::

## UnoCSS 预设配置

```ts [uno.config.ts]
import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetNuxtUI, presetNuxtUIExtra } from 'unocss-preset-nuxt-ui'

export default defineConfig({
  presets: [
    presetNuxtUI(),      // 必须在 presetWind4 之前
    presetWind4(),
    presetNuxtUIExtra(), // 必须在 presetWind4 之后
  ],
  transformers: [
    transformerDirectives(),   // 支持 @apply 等 CSS 指令
    transformerVariantGroup(), // 支持 hover:(bg-red text-white) 变体分组
  ],
})
```

::warning{icon="i-lucide-alert-triangle"}
预设加载顺序至关重要：`presetNuxtUI()` 必须在 `presetWind4()` **之前**，`presetNuxtUIExtra()` 必须在 `presetWind4()` **之后**。顺序错误将导致样式异常。
::

::tip
`presetNuxtUI()` 先注册 CSS 变量和基础 token，`presetWind4()` 随后解析引用这些变量的工具类，`presetNuxtUIExtra()` 最后补充 Wind4 无法覆盖的额外样式规则。
::

## TypeScript 配置

添加 `#build/ui` 别名以获得主题配置的类型提示：

```json [tsconfig.json]
{
  "compilerOptions": {
    "paths": {
      "#build/ui": ["./node_modules/.nuxt-ui/ui"],
      "#build/ui/*": ["./node_modules/.nuxt-ui/ui/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue"
  ]
}
```

::note
`@nuxt/ui/vite` 插件会自动生成 `auto-imports.d.ts` 和 `components.d.ts` 类型声明文件，建议将它们加入 `.gitignore`。
::

## Vue 插件注册

```ts [main.ts]
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'

const app = createApp(App)
const router = createRouter({
  routes: [],
  history: createWebHistory(),
})

app.use(router)
app.use(ui)
app.mount('#app')
```

## 根组件包装

使用 `<UApp>` 包裹应用内容，提供 Nuxt UI 的全局配置上下文：

```vue [Component.vue] [App.vue]
<template>
  <UApp>
    <router-view />
  </UApp>
</template>
```

::note
`<UApp>` 是 Toast、Tooltip 和程序化覆盖层（Overlay）正常工作的前提。
::

## 样式文件

由于使用 UnoCSS 而非 Tailwind CSS，不能直接 `@import "@nuxt/ui"`。需要手动处理样式：

### 目录结构

```text
src/styles/
  nuxt-ui/
    main.scss       # Nuxt UI 主样式入口
    keyframes.css   # 动画关键帧（从 node_modules 复制）
  index.ts          # 样式总入口
```

### keyframes.css

从 `node_modules/@nuxt/ui/dist/runtime/keyframes.css` 复制到项目中，包含手风琴展开/折叠、Toast 弹出、滑动面板等 30+ 个动画关键帧。

### main.scss

```scss [src/styles/nuxt-ui/main.scss]
@use './keyframes.css';

@layer components, base, properties;

body {
  background-color: var(--ui-bg);
  color: var(--ui-text-highlighted);
  -webkit-font-smoothing: antialiased;
}

// Nuxt UI gap 类预置值
.\[\--gap\:\--spacing\(4\)\] {
  --gap: calc(var(--spacing) * 4);
}

.\[\--gap\:\--spacing\(16\)\] {
  --gap: calc(var(--spacing) * 16);
}
```

### 导入样式

```ts [src/styles/index.ts]
import './nuxt-ui/main.scss'
```

### HTML 入口

在根容器上添加 `isolate` 类，确保样式作用域隔离：

```html [index.html]
<div id="app" class="isolate"></div>
```

### 自定义主题色

在 `main.scss` 中覆盖 CSS 变量即可自定义颜色：

```scss [src/styles/nuxt-ui/main.scss]
:root {
  --color-green-50: #effdf5;
  --color-green-100: #d9fbe8;
  --color-green-200: #b3f5d1;
  // ... 完整色阶
  --color-green-950: #052e16;
}
```

## 组件使用

Nuxt UI 组件通过自动导入直接在模板中使用，所有组件以 `U` 为前缀：

```vue [Component.vue]
<template>
  <UButton variant="soft" color="primary">
    提交
  </UButton>

  <UButton variant="outline" color="neutral">
    取消
  </UButton>
</template>
```

::callout{icon="i-lucide-book" to="https://ui.nuxt.com/docs/getting-started/theme/components"}
查看 Nuxt UI 组件主题自定义文档了解更多变体和配色选项。
::

## 参考资料

- [Nuxt UI 官方文档 - Vue 安装](https://ui.nuxt.com/docs/getting-started/installation/vue)
- [unocss-preset-nuxt-ui](https://github.com/lehuuphuc/unocss-preset-nuxt-ui) - UnoCSS 预设
- [Nuxt UI 设计系统](https://ui.nuxt.com/docs/getting-started/theme/design-system)
- [Nuxt UI CSS 变量](https://ui.nuxt.com/docs/getting-started/theme/css-variables)
