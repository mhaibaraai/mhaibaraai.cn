---
title: Node
description: Node 的配置和使用指南。
---

## Node 的版本选择

- **LTS 版本**（长期支持版本）：稳定版本，通常用于生产环境。
- **Current 版本**（当前版本）：最新的主要版本，加入最新特性和改进，通常用于开发和测试。

## 安装配置

### 使用包管理器安装

::note{icon="i-lucide-package"}
包版本管理工具的主要好处在于帮助开发者更方便地管理多个版本的 Node 和 npm。
::

- [nvm](https://github.com/nvm-sh/nvm) 最受欢迎的 Node 版本管理工具，适用于 macOS 和 Linux。
- [nvm-windows](https://github.com/coreybutler/nvm-windows) `nvm` 的 Windows 版本，专为 Windows 开发者设计。
- [fnm](https://github.com/Schniz/fnm) 也是 macOS 的优秀选择，具备轻量和高效的特点，适合那些不想耗费系统资源的开发者。

### 直接下载安装

::callout{title="Node.js 官网" color="neutral" icon="i-lucide-download" to="https://nodejs.org/"}
从 Node.js 官网下载安装包（`.pkg`、`.msi`、`.tar.gz` 文件）
::

::tabs


:::tabs-item{label="Linux"}
```sh [sh]
# 安装 unzip
sudo apt-get update && sudo apt-get install -y unzip
# 安装 fnm
curl -o- https://fnm.vercel.app/install | bash
# 重新加载环境
source /root/.bashrc
# 安装 Node.js
fnm install 22
# 验证 Node.js 版本
node -v # Should print "v22.18.0".
# 验证 npm 版本
npm -v # Should print "10.9.3".
# 启用 pnpm
corepack enable pnpm
```
:::

:::tabs-item{label="macOS"}
```sh [sh]
brew install node
```
:::

:::tabs-item{label="Windows"}
```sh [sh]
winget install --id=OpenJS.Nodejs
```
:::

::

## 实用命令

- 删除所有 `node_modules` 文件夹

  ```sh [sh]
  find . -name 'node_modules' -type d -prune -execdir rm -rf '{}' +
  ```

- 递归删除 `packages` 和 `internal` 目录下的 `dist` 文件夹，同时忽略 `node_modules` 目录

  ```sh [sh]
  find packages internal -path '*/node_modules/*' -prune -o -name 'dist' -type d -exec rm -rf {} + || true
  ```

- `postinstall` 钩子在安装依赖后执行，可以用来执行一些构建操作，比如构建、设置环境或修复依赖关系。

  ```json [package.json]
  {
    "scripts": {
      "postinstall": "pnpm build",
      "build": "pnpm clean && pnpm -r -F='./packages/**' -F='./internal/**' run build",
      "clean": "find packages internal -path '*/node_modules/*' -prune -o -name 'dist' -type d -exec rm -rf {} + || true"
    }
  }
  ```

## 笔记

### 参数传递

- 当你使用 `npm run` 命令时，如果你想要传递参数给你的脚本，你需要在参数前加上 `--` , 例如：

```sh [sh]
npm run gen:cc -- --path ol-cesium-map --name demo
```

这样，`--path ol-cesium-map --name demo` 就会被传递给你的脚本，而不是 `npm run` 命令。

- 使用 `mri` 来解析这些参数：

```ts [index.ts]
const argv = process.argv.slice(2)
const mriData = mri<MriData>(argv)

// mriData : { _: [], path: 'ol-cesium-map', name: 'demo' }
```

### 增加 node 内存限制

通过 `--max_old_space_size` 选项，你可以指定更大的内存使用限制，构建大项目时能有效避免内存不足导致的 `JavaScript heap out of memory` 错误

```sh [sh]
export NODE_OPTIONS=--max_old_space_size=10240
```

或者在 `package.json` 中的 `scripts` 中指定：

```json [package.json]
{
  "scripts": {
    "build": "NODE_OPTIONS=--max_old_space_size=10240 react-scripts build"
  }
}
```
