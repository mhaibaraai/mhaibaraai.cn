---
title: macOS
description: 记录一次 Mac 环境配置
---

::note{ to="https://brew.sh/zh-cn/"}
Homebrew ： macOS（或 Linux）缺失的软件包的管理器
::

::note{ to="https://iterm2.com/"}
iTerm2 ： macOS Terminal Replacement
::

::note{ to="https://ohmyz.sh/"}
Oh My Zsh ： a delightful &amp; open source framework for Zsh
::

## 配置 Homebrew

[Homebrew](https://brew.sh/zh-cn/)（通常称为 Brew）是 macOS 和 Linux 上的一个流行的包管理器，用于简化软件的安装和管理。

::steps{level="3"}

### 打开终端

在应用程序文件夹中找到终端（Terminal），或使用 Spotlight 搜索“终端”，在终端中输入以下命令并按回车

```sh [sh]
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 配置环境变量

安装完成后，可能需要将 Homebrew 添加到你的 PATH 中，按提示操作，例如：

::code-collapse

```text {4-5} [log]
==> Next steps:

 - Run these two commands in your terminal to add Homebrew to your PATH:
   (echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> /Users/yixuanmiao/.zprofile // [!code focus]
     eval "$(/opt/homebrew/bin/brew shellenv)" // [!code focus]
 - Run brew help to get started
 - Further documentation:
https://docs.brew.sh
```

::

```sh [sh]
(echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> /Users/yixuanmiao/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 验证安装

输入以下命令检查 Homebrew 是否安装成功：

```sh [sh]
brew --version
```

输出:

```text [log]
Homebrew 4.3.23-56-g9160445
```

::

## 安装 Iterm2

[Iterm2](https://iterm2.com/) 是 macOS 上一款功能强大的终端仿真器，提供了许多增强的功能和自定义选项。

![iterm2](/images/guides/os/macos/iterm2.png)

::steps{level="3"}

### 下载

- 访问 [Iterm2 官网](https://iterm2.com/) 下载最新版本的 Iterm2
- 或者使用 Homebrew 安装

  ```sh [sh]
  brew install --cask iterm2
  ```

### 将 iTerm2设置为默认终端

打开 iTerm2，选择菜单栏中的 `iTerm2 -> Make iTerm2 Default Term`

![默认终端](/images/guides/os/macos/iterm2-default.png)

### 配置迁移(可选)

如果你之前使用过终端，可以将配置迁移过来,并将其设置为默认配置。

- iTerm2 -> Setting -> Profiles -> Other Actions
- Save Profile as JSON (保存配置文件)
- Import JSON Profiles (导入配置文件)
- Set as Default (设置为默认配置)

![import](/images/guides/os/macos/iterm2-import.png)

### 更改主题

- iTerm2 -> Setting -> Profiles -> Colors-> Color Presets
- 选择你喜欢的主题 (例如：Solarized)

![theme](/images/guides/os/macos/iterm2-theme.png)

### 调整 Status Bar

- iTerm2 -> Setting -> Profiles -> Session -> Status Bar
- 勾选 Enable status bar
- 配置你需要的信息

![status](/images/guides/os/macos/iterm2-status.png)

将上方 Status Bar Component Menu 中的内容拖动到 Active Components 中，即可显示在状态栏中。

![status-active](/images/guides/os/macos/iterm2-status-active.png)
::

## Oh My Zsh

[`Oh My Zsh`](https://ohmyz.sh/) 是一个流行的 Zsh 配置管理工具，旨在简化 Zsh 的配置和管理。它提供了许多预配置的插件、主题以及一些便捷的功能，帮助用户提高终端使用效率。

```sh [sh]
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

安装完成后，`Oh My Zsh` 会自动创建一个配置文件 `~/.zshrc`。你可以在这个文件中进行自定义：

- **修改主题**： 找到 `ZSH_THEME` 这一行，修改为你喜欢的主题（例如 `robbyrussell`、`powerlevel10k/powerlevel10k` 等）。
- **启用插件**： 在 `plugins=(...)` 一行中添加你需要的插件，如 `git`、`zsh-autosuggestions`、`zsh-syntax-highlighting` 等。

::tip
每次修改完 `~/.zshrc` 后，运行以下命令以应用更改：

```sh [sh]
source ~/.zshrc
```
::

### 修改主题 Powerlevel10k

`Powerlevel10k` 是一个非常流行的 Zsh 主题，它以速度和高度可定制化著称，能够为你的终端提供丰富的信息和美观的外观。

::steps{level="4"}

#### 克隆 Powerlevel10k 到 `oh-my-zsh` 主题目录

```sh [sh]
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k
```

#### 启用 Powerlevel10k 主题

- 打开 `~/.zshrc` 文件

  ```sh [sh]
  code ~/.zshrc
  ```

- 找到 `ZSH_THEME="..."` 这一行，修改为：

  ```sh [sh]
  ZSH_THEME="powerlevel10k/powerlevel10k"
  ```

- 保存并退出编辑器，然后运行以下命令以应用更改：

  ```sh [sh]
  source ~/.zshrc
  ```

#### 配置 Powerlevel10k

安装完成后，首次启动 Zsh 时会自动启动 Powerlevel10k 配置向导，它会引导你选择主题的外观和信息显示内容。

如果你想重新配置 Powerlevel10k，可以运行以下命令：

```sh [sh]
p10k configure
```

以下是配置向导的示例：

- 自动安装所需字体

  ::code-collapse

  ```text [log]
  This is Powerlevel10k configuration wizard. It will ask you a few questions and
                          configure your prompt.

                          Install Meslo Nerd Font?

  (y)  Yes (recommended).

  (n)  No. Use the current font.

  (q)  Quit and do nothing.

  Choice [ynq]: y
  ```

  ::

- 手动安装字体 [MesloLGS Nerd Font GitHub](https://github.com/romkatv/powerlevel10k#manual-font-installation)
- 生成配置文件

配置完成后，向导会生成一个 `~/.p10k.zsh` 文件，保存用户的所有设置。

::

### 安装插件

Oh My Zsh 提供了多种实用插件，能够提升你的开发效率。以下是一些常用的插件：

- **git**：方便 git 操作，缩短命令长度
- **zsh-autosuggestions**：根据历史命令自动补全
- **zsh-syntax-highlighting**：根据语法高亮显示命令

```sh [sh]
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

然后在 `~/.zshrc` 文件中启用这两个插件：

```sh [sh]
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

启用插件后，运行以下命令以应用更改：

```sh [sh]
source ~/.zshrc
```
