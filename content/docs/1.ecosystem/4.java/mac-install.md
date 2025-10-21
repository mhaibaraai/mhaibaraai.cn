---
title: 安装 Java 与构建工具
description: 如何使用 Homebrew 在 macOS 上安装和管理多个 Java 版本。
---

在 macOS 上，推荐使用 [Homebrew](https://brew.sh/) 来安装和管理软件包。

## 安装 Java

您可以选择安装最新版本的 OpenJDK，或者安装特定的 LTS (长期支持) 版本，如 Java 17。

```sh [sh]
# 安装最新版本 (例如 Java 21)
brew install openjdk

# 安装 LTS 版本 (例如 Java 17)
brew install openjdk@17
```

::note
Homebrew 会将它们安装在 Apple Silicon (`/opt/homebrew/opt/`) 或 Intel (`/usr/local/opt/`) 芯片的对应目录下。
::

## 配置环境变量

安装完成后，Homebrew 会提示您如何配置。以 OpenJDK 17 为例，您需要执行以下步骤：

::code-collapse
```text
==> openjdk@17
For the system Java wrappers to find this JDK, symlink it with
  sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

openjdk@17 is keg-only, which means it was not symlinked into /opt/homebrew,
because this is an alternate version of another formula.

If you need to have openjdk@17 first in your PATH, run:
  echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

For compilers to find openjdk@17 you may need to set:
  export CPPFLAGS="-I/opt/homebrew/opt/openjdk@17/include"
```
::

根据提示，将 Java 添加到系统环境变量中：

```sh [sh]
# 1. 创建符号链接，让系统能识别 JDK
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# 2. 配置 PATH 环境变量
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# 3. 设置 JAVA_HOME (推荐)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc

# 4. 重新加载配置
source ~/.zshrc
```

## 使用 jenv 管理多版本

当您需要频繁切换多个 Java 版本时，`jenv` 是一个强大的工具。

### 1. 安装和配置 jenv

```sh [sh]
# 安装 jenv
brew install jenv

# 添加到 Zsh (推荐)
echo 'export PATH="$HOME/.jenv/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(jenv init -)"' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc
```

### 2. 添加 Java 版本到 jenv

将已安装的 Java 版本添加到 `jenv` 进行管理：

```sh [sh]
# 添加 Java 17
jenv add $(/usr/libexec/java_home -v 17)

# 添加最新版 Java
jenv add $(/usr/libexec/java_home)
```

### 3. 查看和设置版本

```sh [sh]
# 查看所有可用版本
jenv versions

# 设置全局默认版本
jenv global 17.0

# 查看当前版本
jenv version
```
