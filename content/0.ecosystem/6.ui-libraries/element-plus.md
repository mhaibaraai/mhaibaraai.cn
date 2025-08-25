---
title: Element Plus
description: 在使用 Element Plus 组件库时遇到的常见问题及其解决方案。
---

## Tree 树节点过滤时保留父节点和子节点

::code-collapse

```vue [FilterableTree.vue]
<script setup lang="ts">
import type { ElTree } from 'element-plus'
import { ref, watch } from 'vue'

interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

function filterNode(value: string, data: Tree) {
  if (!value)
    return true
  return check(data, value)
}

function check(node: Tree, value: string): boolean {
  if (node.label.includes(value))
    return true

  if (node.children)
    return node.children.some(child => check(child, value))

  return false
}

const data: Tree[] = [
  {
    id: 1,
    label: 'Level one 1',
    children: [
      {
        id: 4,
        label: 'Level two 1-1',
        children: [
          {
            id: 9,
            label: 'Level three 1-1-1',
          },
          {
            id: 10,
            label: 'Level three 1-1-2',
          },
        ],
      },
    ],
  },
]
</script>

<template>
  <el-input v-model="filterText" placeholder="Filter keyword" />
  <el-tree
    ref="treeRef"
    class="filter-tree"
    :data="data"
    :props="{ children: 'children', label: 'label' }"
    default-expand-all
    :filter-node-method="filterNode"
  />
</template>
```

::

## 无法找到模块 `element-plus/dist/locale/zh-cn.mjs` 的声明文件

::caution
无法找到模块 `element-plus/dist/locale/zh-cn.mjs` 的声明文件。`/node_modules/element-plus/dist/locale/zh-cn.mjs` 隐式拥有 "any" 类型。
如果 `element-plus` 包实际公开了此模块，请尝试添加包含 `declare module 'element-plus/dist/locale/zh-cn.mjs';` 的新声明(.d.ts)文件ts-plugin
::

- 使用正确的 Locale 模块路径 （推荐）

  element-plus 从 `2.2.0` 开始，推荐从 `element-plus/es/locale/lang/` 导入语言包。修改你的导入语句如下：

  ```ts [main.ts]
  import zhCn from 'element-plus/es/locale/lang/zh-cn'
  ```

- 添加手动类型声明

  ```ts [d.ts]
  declare module 'element-plus/dist/locale/zh-cn.mjs' {
    import { Language } from 'element-plus/es/locale'

    const zhCn: Language
    export default zhCn
  }
  ```
