---
title: 按需自动导入
description: 组件、API 和图标按需自动导入，简化代码并提升开发效率。
---

## 自动导入组件和 API

::callout{icon="i-lucide-book"}
[unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)、
[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import)
::

通过以下配置，可以实现 `vue`、`@vueuse/core` 的 API 以及 `Element Plus` 组件的自动导入。

```sh [sh]
pnpm add -D unplugin-vue-components unplugin-auto-import
```

```ts [vite.config.ts]
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
      ],
    }),
  ],
})
```

## 自动导入图标

结合 [`unplugin-icons`](https://github.com/unplugin/unplugin-icons) 可以在项目中方便地使用 [Iconify](https://icon-sets.iconify.design/) 中的海量图标。

::steps{level=3}

### 安装图标集

::note
如果只需要使用特定图标集，可以单独安装，例如 `ep` (Element Plus) 和 `maki` 图标集。
::

```sh [sh]
pnpm add -D @iconify-json/ep @iconify-json/maki
```

### 配置 Vite 插件

在 `vite.config.ts` 中配置 `unplugin-icons` 的 `IconsResolver` 和 `Icons` 插件。

::code-collapse

```ts [vite.config.ts]
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: 'icon',
        }),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          enabledCollections: ['ep', 'maki'],
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
})
```

::

### 在 `tsconfig.json` 中添加类型

::note
为了让 TypeScript 识别通过 `~icons/...` 导入的图标类型，需要添加相应的类型声明。
::

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": [
      "unplugin-icons/types/vue"
    ]
  }
}
```

### 使用图标

配置完成后，可以直接在模板中使用 `<icon-ep-user-filled />` 这样的组件，或者通过 `import IconMakiAnimalShelter from '~icons/maki/animal-shelter'` 的方式在脚本中导入图标。
