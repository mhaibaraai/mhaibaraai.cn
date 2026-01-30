---
title: Nuxt Layer ESM/CJS 兼容问题
description: 在 Nuxt Layer 架构中使用 pnpm 时，解决 ESM/CJS 模块互操作错误的方法
---

## 问题描述

在 Nuxt Layer 架构中，使用 pnpm 作为包管理器时，遇到了 ESM/CJS 模块互操作错误：

```log
SyntaxError: The requested module does not provide an export named 'default'
```

典型错误包括：
- `extend` 包（`unified` 的依赖）
- `debug` 包（`micromark` 的依赖）
- `@vercel/oidc` 包（`@ai-sdk/gateway` 的依赖）

## 根本原因

### pnpm 依赖隔离

pnpm 使用严格的依赖隔离机制，子依赖的子依赖无法从项目根目录直接访问。

### Layer 路径解析问题

Nuxt 模块（如 `@nuxtjs/mdc`）在配置 Vite 的 `optimizeDeps.include` 时，使用了简化的依赖路径：

```typescript
// @nuxtjs/mdc 模块内部添加的路径
'@nuxtjs/mdc > debug'
'@nuxtjs/mdc > unified'
```

但在 Layer 架构中，正确的路径应该包含完整的依赖链：

```typescript
// Layer 架构中的正确路径
'@movk/nuxt-docs > @nuxtjs/mdc > debug'
'@movk/nuxt-docs > @nuxtjs/mdc > unified'
```

### CJS 包的 ESM 兼容性

部分 CommonJS 包（如 `extend`、`debug`）在被 Vite 作为 ESM 导入时，导出不兼容，需要预构建转换。

## 解决方案

在 Layer 的 `nuxt.config.ts` 中使用 `vite:extendConfig` hook，重写模块配置的依赖路径。

### 配置代码

```typescript [layer/nuxt.config.ts]
export default defineNuxtConfig({
  hooks: {
    // Rewrite optimizeDeps paths for layer architecture
    'vite:extendConfig': (config) => {
      const include = config.optimizeDeps?.include
      if (!include) return

      // 重写 layer 子模块的依赖路径
      const layerPkgs = /^(?:@nuxt\/content|@nuxtjs\/mdc|@nuxt\/a11y) > /
      include.forEach((id, i) => {
        if (layerPkgs.test(id)) include[i] = `@movk/nuxt-docs > ${id}`
      })

      // 手动添加需要预构建的 CJS 依赖
      include.push(
        '@movk/nuxt-docs > @nuxt/content > slugify',
        '@movk/nuxt-docs > @ai-sdk/gateway > @vercel/oidc'
      )
    }
  }
})
```

### 工作原理

1. **`vite:extendConfig` hook**：在所有模块配置完成后执行，确保能捕获所有依赖
2. **正则匹配重写**：使用 `(?:...)` 非捕获组匹配需要重写的包前缀
3. **路径前缀追加**：将 `@movk/nuxt-docs >` 前缀添加到匹配的依赖路径前
4. **手动添加深层依赖**：对于子依赖的 CJS 包，显式添加完整路径

## 扩展说明

### 添加新的 Layer 模块

如果 Layer 添加了新的 Nuxt 模块，需要在正则中添加对应的包名：

```typescript
const layerPkgs = /^(?:@nuxt\/content|@nuxtjs\/mdc|@nuxt\/a11y|@新模块名称) > /
```

### 添加新的 CJS 依赖

如果遇到新的 CJS 兼容性问题，在 `include.push()` 中添加完整路径：

```typescript
include.push(
  '@movk/nuxt-docs > @nuxt/content > slugify',
  '@movk/nuxt-docs > @ai-sdk/gateway > @vercel/oidc',
  '@movk/nuxt-docs > @父包 > @问题包'  // 新增的依赖
)
```

## 注意事项

1. **清除缓存**：修改配置后需要清除所有缓存：
   ```bash
   rm -rf docs/.nuxt layer/.nuxt docs/node_modules/.cache node_modules/.vite
   ```
3. **使用者项目的依赖**：Layer 只能处理自身依赖的路径问题，使用者项目自己的依赖需要在他们的项目中配置
