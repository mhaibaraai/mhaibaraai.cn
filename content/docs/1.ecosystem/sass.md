---
title: Sass 预处理器
description: Sass 模块化、构建工具配置和弃用警告处理
---

## 模块化与项目结构

### 推荐用法

- `@use`：引入模块，成员默认有命名空间，避免冲突
- `@forward`：转发模块成员，构建聚合 API
- `pkg:` 语法：直接从依赖包导入样式

```scss
// 推荐：模块化引入
@use "bootstrap" as b;

.element {
  @include b.float-left;
  border: 1px solid b.theme-color("dark");
  margin-bottom: b.$spacer;
}

// 转发用法
@forward "functions";
@forward "variables";
@forward "mixins";
```

### 命名空间与配置

- `@use "lib" as *;` 取消命名空间（不推荐，易冲突）
- `@use "lib" with ($color: blue);` 传递配置变量

```scss
@use "sass:color";
$base-color: #abc;
@use "library" with (
  $base-color: $base-color,
  $secondary-color: color.scale($base-color, $lightness: -10%)
);
```

### 包导入与 package.json 配置

- 推荐包作者在 `package.json` 增加 `sass` 字段
- 消费者可用 `@use 'pkg:library';` 导入依赖包样式

::code-group

```json [package.json]
{
  "exports": {
    ".": {
      "sass": "./dist/scss/index.scss",
      "import": "./dist/js/index.mjs",
      "default": "./dist/js/index.js"
    }
  }
}
```

```scss [package-import-demo.scss]
@use 'pkg:bootstrap';
```

::

## 主流构建工具配置

### Vite

在 `vite.config.ts` 配置 Sass 选项：

```ts [vite.config.ts]
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 推荐使用 modern-compiler API
        api: 'modern-compiler'
      }
    }
  }
})
```

### Webpack

需安装 `sass-loader`，自动支持 `@use`/`@forward` 语法。

## 弃用警告与应对

Sass 正在逐步淘汰部分旧特性，常见弃用警告包括：

- **@import**：已弃用，推荐使用 `@use` 和 `@forward`
- **slash-div**：`/` 作为除法符号已弃用，建议用 `math.div()`
- **legacy-js-api**：旧版 JS API 已弃用
- **type-function**、**call-string**、**@elseif**、**new-global** 等

可通过编译器参数如 `fatalDeprecations`、`futureDeprecations`、`silenceDeprecations` 控制警告行为。

```text
[Deprecation] '@import' is deprecated. Use '@use' or '@forward' instead.
```
