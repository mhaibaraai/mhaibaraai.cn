---
title: Homebrew
description: Homebrew 的配置和使用指南。
---

::note{icon="i-lucide-package" to="https://brew.sh/zh-cn/"}
Homebrew ： macOS（或 Linux）缺失的软件包的管理器
::

## 安装 Homebrew

::steps{level="3"}

### 安装命令

```sh [sh]
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 添加 Homebrew 到系统路径

::tip
安装完成后，Homebrew 可能不会自动添加到你的系统路径中。根据你的 Mac 使用的是 Intel 处理器还是 Apple Silicon（M1/M2 等），路径有所不同。
::

::tabs

  :::tabs-item{label="Intel 处理器"}
  ```sh [sh]
  echo 'eval "$(/usr/local/bin/brew shellenv)"' >> /Users/$(whoami)/.zprofile
  eval "$(/usr/local/bin/brew shellenv)"
  ```
  :::

  :::tabs-item{label="Apple Silicon (M1/M2)"}
  ```sh [sh]
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/$(whoami)/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
  ```
  :::

::

### 验证安装

```sh [sh]
brew --version
```

输出：

```sh [sh]
Homebrew 4.3.23-56-g9160445
```
::

## 配置文件导出

在当前目录下导出 Homebrew 的软件包列表和配置文件。

```sh [sh]
# 导出已安装的软件包列表
brew list --formula > brew-packages.txt
# 导出已安装的 Cask 软件包列表
brew list --cask > brew-cask-packages.txt
# 导出 Homebrew 的配置
brew config > brew-config.txt
```

将文件保存到指定目录： `/path/to/your/directory/`

```sh [sh]
brew list --formula > /path/to/your/directory/brew-packages.txt
```

## 导入软件包和配置

```sh [sh]
# 导入已安装的软件包列表
xargs brew install < brew-packages.txt
# 导入已安装的 Cask 软件包列表
xargs brew install --cask < brew-cask-packages.txt
```

::tip
一般情况下，Homebrew 的配置不会随着系统的重装等过程丢失，因此不需要专门导入配置
::
