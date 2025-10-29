---
title: 踩坑笔记
description: 常见问题及其解决方案。
---

## 打包失败 Missing "./preload-helper" export in "vite" package

::caution
打包失败：`Missing "./preload-helper" export in "vite" package`
::

搜索 `vite/preload-helper` 替换为 `\0vite/preload-helper`

## vue-element-admin 安装第三包（npm install）时报错

::caution
控制台报错：`ls-remote -h -t git://github.com/adobe-webplatform/eve.git`
::

- 修改 Git 的协议（ssh 替换为 https）

  ```sh
  git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"
  ```

- 切换镜像网站

  ```sh
  git config --global url."https://hub.fastgit.xyz/".insteadOf "ssh://git@github.com/"
  ```

## 使用 import.meta.env 获取环境变量提示类型 “ImportMeta” 上不存在属性 “env”

在 `tsconfig.json` 中添加 `"types": ["vite/client"]`

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

::tip
实际上启用了 Vite 提供的类型支持，这让 TypeScript 能够理解并正确处理 Vite 特有的代码结构，如环境变量访问。这是确保 TypeScript 项目中 Vite 功能正确工作的关键配置。
::

## JSX 元素隐式具有类型 "any"，因为不存在接口 "JSX.IntrinsicElements" 的索引签名

在 `tsconfig.json` 中添加 `"jsx": "preserve"` 和 `"jsxImportSource": "vue"`

```json [tsconfig.json]
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

::note{to="https://vuejs.org/guide/extras/render-function.html#jsx-type-inference"}
根据 vue 指南，这是由以下更改引起的：
  > Starting in Vue 3.4, Vue no longer implicitly registers the global JSX namespace，从 Vue 3.4 开始，Vue 不再隐式注册全局 JSX 命名空间
::

## Big integer literals are not available in the configured target environment (“chrome87“, “edge88“)

在 `vite.config.ts` 中添加：

```ts [vite.config.ts]
export default defineConfig({
  // ...
  build: {
    target: 'esnext', // you can also use 'es2020' here
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // you can also use 'es2020' here
    },
  },
})
```

另外，请确保你的 Typescript 目标足够高：

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "ES2020" // you can also use higher value
  // ...
  }
}
```
