---
title: Node.js 版本兼容
description: Node.js 版本升级导致的原生模块 ABI 不兼容问题及解决方案
---

## Node.js ABI (Application Binary Interface) 版本不兼容

::caution

Node.js 的 ABI 版本不兼容问题。

```log [log]
The module '/Users/yixuanmiao/MOVK/mhaibaraai.cn/node_modules/.pnpm/better-sqlite3@12.2.0/node_modules/better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 137. Please try re-compiling or re-installing
the module (for instance, using npm rebuild or npm install).
```

::

### 问题分析

报错信息核心是：

* `better_sqlite3.node` 是用 **NODE\_MODULE\_VERSION 127** 编译的
* 当前运行的 Node.js 版本需要 **NODE\_MODULE\_VERSION 137**
* 升级了 Node.js（或者切换了版本），但本地依赖里的原生模块 `better-sqlite3` 没有重新编译

### 最优解决方案（推荐顺序执行）：

1. **删除依赖并重装**

   ```sh [sh]
   rm -rf node_modules
   pnpm store prune
   pnpm install
   ```

2. **强制重编译 better-sqlite3**

   ```sh [sh]
   pnpm rebuild better-sqlite3
   ```

   或者全局重编译所有原生依赖：

   ```sh [sh]
   pnpm rebuild
   ```

要快速验证是否修复，可以运行：

```sh [sh]
node -e "require('better-sqlite3')"
```

如果没有报错，就说明 ABI 版本对上了。
