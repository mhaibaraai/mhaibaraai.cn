---
title: Nuxt 4 CommonJS 依赖问题
description: 解决 Nuxt 4.2 环境下 Vite 对 CommonJS 依赖（extend、debug）的兼容性问题。
---

::note
**环境信息**
- Nuxt 版本: 4.2.0
- Vite 版本: 7.1.12
- @nuxt/content 版本: 3.8.0
::

## 问题描述

在 Nuxt 4.2.0 环境下启动项目时，浏览器控制台出现警告：

::warning
error.log
```text
The requested module '/_nuxt/@fs/Users/.../node_modules/.pnpm/extend@3.0.2/node_modules/extend/index.js?v=ceccc7a5' does not provide an export named 'default'

The requested module '/_nuxt/@fs/Users/yixuanmiao/MOVK/movk-nuxt-docs/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js?v=c82ce804' does not provide an export named 'default'
```
::

## 问题原因

这是一个 **CommonJS 和 ESM 模块系统兼容性问题**：

- `extend` 和 `debug` 是老旧的 CommonJS 包，使用 `module.exports` 导出
- 项目配置为 ESM 模式（`package.json` 中设置了 `"type": "module"`）
- Nuxt 4.2+ 对 CommonJS 依赖更严格，需要在 Vite 中显式配置预打包

## 解决方案

### 方法 1：配置 Vite 别名 + 动态导入（推荐）

修改 `nuxt.config.ts`：

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: [
        'extend', // unified 所需（用于 @nuxt/content 的 markdown 处理）
        'debug', // Babel 和开发工具所需
      ]
    },
    resolve: {
      alias: {
        extend: 'extend/index.js',
        debug: 'debug/src/browser.js'
      }
    }
  }
})
```

### 方法 2：替换为现代替代方案（最佳实践）

使用 Nuxt 原生支持的包：

```bash [pnpm]
pnpm install defu
```

然后使用：

```typescript
import { defu } from 'defu'

const merged = defu(obj1, obj2)
```

或使用 lodash-es：

```bash
npm install lodash-es
```

```typescript
import { merge } from 'lodash-es'
```

### 方法 3：使用命名导入

```javascript
import * as extend from 'extend';
```

### 方法 4：使用 Nuxt 的 auto-import（如果在组件/composables中）

创建一个 composable：`composables/useExtend.ts`

```typescript
export const useExtend = () => {
  // 动态导入
  const extend = import('extend').then(m => m.default || m);
  return extend;
}
```

### 方法 5：仅在服务端使用

如果只在服务端需要，可以这样：

```typescript
// server/api/something.ts
const extend = require('extend') // Node.js 环境可以用 require
```

## 相关资源

::callout{color="primary"}
- [Vite 依赖优化文档](https://cn.vite.dev/config/dep-optimization-options.html)
- [Nuxt Content 官方文档](https://content.nuxt.com)
::
