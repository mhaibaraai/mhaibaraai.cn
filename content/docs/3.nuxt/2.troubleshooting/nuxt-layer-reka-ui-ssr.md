---
title: Nuxt Layer reka-ui SSR 500 错误
description: 解决在 Nuxt Layer 架构下，reka-ui 多实例加载导致 Vercel SSR 500 错误（Cannot read properties of null (reading 'ce')）的问题。
---

## 问题现象

::caution
在 Vercel 上部署使用 Nuxt Layer 的项目时，所有页面返回 500 错误，且 **Vercel 运行时日志为空**。

- 浏览器控制台报：`Hydration completed but contains mismatches`
- Vercel 返回：`Cannot read properties of null (reading 'ce')`
- 本地开发（macOS）完全正常，切换 Node.js 版本无效
- 路由显示为 `/__fallback`（Nitro SSR catch-all），执行耗时约 77ms

```json [error-response]
{
  "statusCode": 500,
  "statusMessage": "Server Error",
  "message": "Cannot read properties of null (reading 'ce')"
}
```
::

## 根本原因

### Nuxt Layer 的模块路径重复问题

典型的出问题的依赖链：

```plaintext
your-app/
  └─ extends: some-layer          # Nuxt Layer
       └─ @nuxt/ui
            └─ reka-ui            # 通过 Layer 的 node_modules 解析
your-app/
  └─ node_modules/reka-ui         # 直接依赖，通过项目自身 node_modules 解析
```

Nitro 构建 SSR bundle 时，Layer 中的组件和项目中的组件通过**不同的文件系统路径**引用 `reka-ui`：

```plaintext
# Layer 组件 resolve 到：
node_modules/some-layer/node_modules/reka-ui/dist/ConfigProvider.js

# 项目组件 resolve 到：
node_modules/reka-ui/dist/ConfigProvider.js
```

::note
`reka-ui` 的 `ConfigProvider` 使用 Vue 的 `provide/inject` 机制传递上下文。两个不同路径被视为**两个独立的模块实例**，`ConfigProvider` 在路径 A 中 `provide` 的上下文，子组件通过路径 B `inject` 时拿到的是 `null`，导致 `renderSlot` 阶段访问 `null.ce` 报错。
::

### 为什么 macOS 正常而 Vercel（Linux）崩溃

macOS 的 APFS 文件系统大小写不敏感，加上 Vite 的模块缓存，两条路径碰巧 resolve 到同一物理文件。Linux（Vercel 运行环境）严格区分路径，两个不同的符号链接路径会被视为两个独立模块实例。

### 为什么日志为空

错误发生在 Vue 的 `renderSlot` 内部，被 Nitro 的 error handler 直接捕获并以 500 JSON 返回，不经过 `console.error`，因此 Vercel 运行时日志中看不到任何报错。

## 解决方案

在项目的 `nuxt.config.ts` 中将 `reka-ui` 添加到 `build.transpile`：

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  build: {
    transpile: ['reka-ui']
  }
})
```

::tip
这会告诉 Vite/Nitro 不直接引用 `reka-ui` 的预编译产物，而是将其源码纳入构建管线统一编译，所有对 `reka-ui` 的引用（无论来自哪个 Layer）都解析为同一份代码，确保 `provide/inject` 上下文在同一模块实例中流转。
::

## 适用范围

任何通过 `extends` 使用 Nuxt Layer，且 Layer 中包含使用 `provide/inject` 的 UI 库时，均可能遇到此问题。同样的修复方式适用于其他受影响的包：

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  build: {
    transpile: ['reka-ui', 'radix-vue'] // 按需添加
  }
})
```

::note
不只限于 `reka-ui`，所有依赖 `provide/inject` 的 UI 库（如 `radix-vue`）在 Nuxt Layer 架构下均可能遇到相同问题。
::

## 相关 Issue

::note{to="https://github.com/nuxt/nuxt/issues/33677" target="_blank"}
**nuxt/nuxt#33677** — 问题报告
::

::note{to="https://github.com/unovue/reka-ui/issues/1239" target="_blank"}
**unovue/reka-ui#1239** — reka-ui 层兼容性
::
