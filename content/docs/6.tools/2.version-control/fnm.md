---
title: Fnm
description: fnm 的安装、配置、使用、常见问题等。
---

::note{icon="i-lucide-package" to="https://github.com/Schniz/fnm"}
Fast Node Manager (fnm) ： 一个快速的 Node.js 版本管理器，它可以帮助你在不同项目中切换 Node.js 版本。
::

## 安装

::code-group

```sh [curl.sh]
curl -fsSL https://fnm.vercel.app/install | bash
```

```sh [brew.sh]
brew install fnm
```

::

## 配置环境

需要将 fnm 集成到你的 Shell（如 bash、zsh）。可以参考输出的安装脚本，或手动添加以下命令到你的 `.zshrc` 或 `.bashrc` 文件中：

```sh [sh]
eval "$(fnm env)"
source ~/.zshrc
```

::note

brew 在安装 fnm 后给出了环境配置的提示，并自动将 fnm 的路径和相关配置追加到 `~/.zshrc` 文件中

::code-collapse

```text
==> Running `brew cleanup fnm`...
Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
Installing for Zsh. Appending the following to /Users/yixuanmiao/.zshrc:

# fnm

FNM_PATH="/Users/yixuanmiao/Library/Application Support/fnm"
if [ -d "$FNM_PATH" ]; then
export PATH="/Users/yixuanmiao/Library/Application Support/fnm:$PATH"
eval "`fnm env`"
fi

In order to apply the changes, open a new terminal or run the following command:

source /Users/yixuanmiao/.zshrc
```

::

::

## 安装 Node.js

```sh [sh]
fnm install <version>
fnm use <version>
```

## 功能参数

- `--use-on-cd`：在每次进入目录时自动切换 Node.js 版本 （✅ 推荐）
- `--version-file-strategy=recursive`：递归查找 `.node-version` 或 `.nvmrc` 文件 （✅ 推荐）
- `--resolve-engines`：解析 `package.json` 中的 `engines.node` 字段 （🧪 实验）

  ```json [package.json]
  {
    "engines": {
      "node": ">=18.0.0"
    }
  }
  ```
- `--corepack-enabled`： 使用 Corepack 作为包管理器 （🧪 实验）

## 常用命令

| 命令                      | 功能说明                      |
| ------------------------- | ----------------------------- |
| `fnm ls-remote`           | 查询所有 Node.js 版本         |
| `fnm install <version>`   | 安装特定版本的 Node.js        |
| `fnm install --lts`       | 安装最新的 LTS 版本           |
| `fnm use <version>`       | 切换 Node.js 版本             |
| `fnm current`             | 查看当前使用的 Node.js 版本   |
| `fnm default <version>`   | 设置默认版本                  |
| `fnm ls`                  | 查看所有已安装的 Node.js 版本 |
| `fnm uninstall <version>` | 卸载 Node.js                  |

## 报错处理

::code-preview

::accordion

  :::accordion-item{label="zsh: command not found: node" icon="i-lucide-circle-help"}

  ::warning{to="https://github.com/Schniz/fnm/issues/1279"}
  github issues : Zsh shell setup command did not work for me
  ::

  如果在使用 `node` 命令时出现 `zsh: command not found: node` 错误，可以尝试在 `.zshrc` 文件中替换以下配置：

  ```diff
  FNM_PATH="/Users/yixuanmiao/Library/Application Support/fnm"
  - if [ -d "$FNM_PATH" ]; then
  export PATH="/Users/yixuanmiao/Library/Application Support/fnm:$PATH"
  eval "`fnm env`"
  - fi
  ```
  :::

::

::
