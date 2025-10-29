---
title: Vercel 部署 llms-full.txt
description: 解决 Vercel 平台上 llms-full.txt 动态路由导致 500 错误的问题，并提供完整的 LLM 友好部署方案。
---

## 问题背景

在 Vercel 平台上部署使用 `nuxt-llms` 模块生成的文档站点时，访问 `/llms-full.txt` 会遇到 500 错误。

::caution
Vercel 会将所有动态路由自动转换为 Serverless Function，导致 `llms-full.txt` 在生产环境无法正常访问。

:::code-collapse
```log [error-log]
2025-10-29T02:54:56.658Z [error] [request error] [unhandled] [GET] https://movk-nuxt-docs-docs-4trjpa04t-yixuans-projects-ca20164e.vercel.app/llms-full.txt
 Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@nuxtjs/mdc' imported from /var/task/chunks/nitro/nitro.mjs
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:255:9)
    ... 8 lines matching cause stack trace ...
    at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:646:36) {
  cause: Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@nuxtjs/mdc' imported from /var/task/chunks/nitro/nitro.mjs
      at Object.getPackageJSONURL (node:internal/modules/package_json_reader:255:9)
      at packageResolve (node:internal/modules/esm/resolve:773:81)
      at moduleResolve (node:internal/modules/esm/resolve:859:18)
      at moduleResolveWithNodePath (node:internal/modules/esm/resolve:989:14)
      at defaultResolve (node:internal/modules/esm/resolve:1032:79)
      at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:783:12)
      at #cachedDefaultResolve (node:internal/modules/esm/loader:707:25)
      at ModuleLoader.resolve (node:internal/modules/esm/loader:690:38)
      at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:307:38)
      at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:646:36) {
    code: 'ERR_MODULE_NOT_FOUND'
  },
  statusCode: 500,
  fatal: false,
  unhandled: true,
  statusMessage: undefined,
  data: undefined
}
```
:::
::

### 问题原因分析

1. **Vercel 路由机制**：Vercel 将动态路由（包括某些静态资源）转为 Serverless Function
2. **文件生成时机**：`llms-full.txt` 在构建时生成，但被误识别为动态路由
3. **访问路径冲突**：LLM 工具期望直接访问静态文本文件，而非通过 Function 处理

## 解决方案

通过创建 Nuxt 模块，在构建时将 `llms-full.txt` 复制为 `_llms-full.txt`，并配置路由规则实现本地代理。

### 1. 创建 Nuxt 模块

创建 `modules/llms.ts` 文件，在 `nitro:build:public-assets` 钩子中复制文件：

```ts [modules/llms.ts]
import { defineNuxtModule } from '@nuxt/kit'
import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineNuxtModule({
  meta: {
    name: 'llms'
  },
  async setup(_options, nuxt) {
    /**
     * Vercel 部署优化
     * @see https://vercel.com/docs/functions/configuring-functions/advanced-configuration
     * 
     * 问题：Vercel 会将所有动态路由转为 Serverless Function，导致 500 错误
     * 方案：访问 '_llms-full.txt' 静态资源以绕过此问题
     */
    nuxt.hook('nitro:build:public-assets', async ({ options }) => {
      const outputDir = options.output.publicDir
      
      try {
        const source = join(outputDir, 'llms-full.txt')
        const dest = join(outputDir, '_llms-full.txt')
        await copyFile(source, dest)
        console.log(`✅ Copied: ${source} → ${dest}`)
      } catch (err) {
        console.warn(
          `⚠️  Failed to process:`,
          err instanceof Error ? err.message : String(err)
        )
      }
    })
  }
})
```

::tip
**关键钩子说明**

- `nitro:build:public-assets`：在 Nitro 构建公共资源后触发
- 此时 `llms-full.txt` 已生成，可安全复制
- 错误处理：使用 `console.warn` 避免构建中断
::

### 2. 配置路由规则

在 `nuxt.config.ts` 中注册模块并配置本地开发代理：

```ts [nuxt.config.ts]
import { createResolver } from '@nuxt/kit'
const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    resolve('./modules/llms') // [!code ++]
  ],
  
  routeRules: {
    // 本地开发环境：代理 _llms-full.txt 到原始路径
    ...process.env.NODE_ENV === 'development'
      ? {
          '/_llms-full.txt': { proxy: '/llms-full.txt' }
        }
      : {}
  }
})
```

::note
**路由规则说明**

- **开发环境**：`/_llms-full.txt` 代理到 `/llms-full.txt`，保持一致性
- **生产环境**：直接访问 `/_llms-full.txt` 静态文件
- 使用条件表达式确保配置仅在开发模式生效
::

### 3. 文档中引用

在 Markdown 文档中添加访问链接：

```mdc [content/docs/llms.md]
::note{to="/llms.txt" target="_blank"}
查看为 Movk Nuxt Docs 文档本身生成的 `/llms.txt` 文件。
::

::note{to="/_llms-full.txt" target="_blank"}
查看为 Movk Nuxt Docs 文档本身生成的 `/_llms-full.txt` 文件。
::
```

### 环境差异处理

| 环境 | 访问路径 | 实际文件 | 说明 |
|------|---------|---------|------|
| **开发** | `/_llms-full.txt` | `/llms-full.txt` (代理) | 保持开发一致性 |
| **生产** | `/_llms-full.txt` | `/_llms-full.txt` (静态) | 绕过 Vercel Function |

## 验证方法

### 本地测试

```bash [bash]
# 构建项目
pnpm build

# 检查生成的文件
ls -la .output/public/*llms*.txt

# 预期输出：
# llms.txt
# llms-full.txt
# _llms-full.txt
```

### 生产环境验证

部署到 Vercel 后，访问以下 URL：

- ✅ `https://your-domain.com/llms.txt`
- ✅ `https://your-domain.com/_llms-full.txt`
- ❌ ~~`https://your-domain.com/llms-full.txt`~~ (可能 500 错误)

## 相关链接

::note{to="https://vercel.com/docs/functions/configuring-functions/advanced-configuration"}
了解 Vercel Serverless Functions 的高级配置
::

::note{to="https://nuxt.com/modules/llms"}
查看 `nuxt-llms` 模块官方文档
::

::note{to="/docs/ecosystem/nuxt/llms"}
查看本站的 Nuxt LLMs 基础配置指南
::
