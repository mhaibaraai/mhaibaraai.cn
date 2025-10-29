---
title: Vite 资源导入
description: Vite 提供了多种灵活的静态资源导入方式，无需手动管理文件路径。
---

## 常用导入方式

| 导入后缀 | 用途 | 示例 |
| --- | --- | --- |
| `?url` | 获取资源处理后的 URL | `import url from './img.png?url'` |
| `?raw` | 获取文件原始内容字符串 | `import text from './data.txt?raw'` |
| `?inline` | 将文件内容内联为 base64 | `import json from './data.json?inline'` |
| `?worker` | 创建一个新的 Web Worker | `import Worker from './worker.js?worker'` |

## 应用场景

下面的示例展示了如何在 Vue 组件中利用 `?url` 后缀导入静态资源 URL。

```vue
<script setup lang="ts">
// 导入图片 URL
import logoUrl from './logo.svg?url'
// 导入 JSON 数据 URL，适用于地图瓦片等场景
import tilesJsonUrl from './tiles.json?url'

const imageSource = logoUrl
</script>

<template>
  <!-- 在模板属性中使用导入的 URL -->
  <img :src="imageSource" alt="Logo">
  <!-- 将 URL 作为属性传递给子组件 -->
  <MapComponent :tiles-url="tilesJsonUrl" />
</template>
```
