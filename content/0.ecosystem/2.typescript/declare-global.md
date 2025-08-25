---
title: 全局变量
description: 在 TypeScript 中使用全局类型。
---

::callout{icon="i-lucide-book"}
[TypeScript 声明文件](https://ts.xcatliu.com/basics/declaration-files.html#%E5%9C%A8-npm-%E5%8C%85%E6%88%96-umd-%E5%BA%93%E4%B8%AD%E6%89%A9%E5%B1%95%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)
::

## 扩展全局变量

::note
使用 `declare global`。这对于为未提供类型定义的第三方库补充类型非常有用。
::

::code-group

```ts [index.ts]
import JSEncrypt from 'jsencrypt'

const encrypt = new JSEncrypt()
encrypt.setPublicKey('publicKey')
encrypt.encrypt('hello')
```

```ts [d.ts]
declare global {
  interface JSEncrypt {
    setPublicKey: (publicKey: string) => void
    setPrivateKey: (privateKey: string) => void
    encrypt: (value: string) => string
    decrypt: (value: string) => string
    getPublicKey: () => string
    getPrivateKey: () => string
  }
}
```

::

## 全局组件类型

::note
为了让 TypeScript 识别并正确提示全局注册的组件（如 `Element Plus` 或 `Ant Design Vue` 的组件），可以在 `tsconfig.json` 中通过 `types` 字段指定全局组件类型定义文件的位置。
::

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": [
      "element-plus/global",
      "ant-design-vue/typings/global"
    ]
  }
}
```
