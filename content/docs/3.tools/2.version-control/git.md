---
title: Git
description: Git 的配置、使用、常见问题等。
---

## Mac

Mac 通常自带 Git ，但如果没有安装，或者你想更新到最新版本，可以通过以下几种方式安装：

::tabs

  :::tabs-item{label="Homebrew"}
  ```sh [sh]
  brew install git
  ```
  :::

  :::tabs-item{label="Xcode"}
  ```sh [sh]
  xcode-select --install
  ```
  :::
::

## Windows

通过 Git 官网下载安装包：[https://git-scm.com/download/win](https://git-scm.com/download/win)

验证是否安装成功：

```sh [sh]
git --version
```

## 配置 Git 用户信息

Git 需要知道提交者的身份信息。通过以下命令设置全局用户信息：

```sh [sh]
# 设置用户名
git config --global user.name "Your Name"
# 设置邮箱
git config --global user.email "Your Email"
```

## 设置默认编辑器（可选）

::tabs

  :::tabs-item{label="Vim"}
  ```sh [sh]
  git config --global core.editor vim
  ```
  :::

  :::tabs-item{label="VSCode"}
  ```sh [sh]
  git config --global core.editor "code --wait"
  ```
  :::

::

## 配置 SSH 密钥（用于 GitHub、GitLab 等远程仓库）

::steps{level="3"}

### 生成 SSH 密钥

```sh [sh]
ssh-keygen -t rsa -b 4096 -C "你的邮箱地址"
```

- `-t rsa`：指定密钥类型为 RSA
- `-b 4096`：指定密钥长度为 4096 位
- `-C "你的邮箱地址"`：指定注释信息为你的邮箱地址，通常是你的 GitHub 邮箱地址

执行命令后，会提示你输入保存密钥的文件路径，按回车键默认保存在 `~/.ssh/id_rsa`。

### 设置密码（可选）

::tip
系统会提示你设置一个密码，这个密码用来加密你的私钥文件。如果你不想设置密码，直接按回车键即可。
::

### 添加 SSH 密钥到 ssh-agent

```sh [sh]
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

::note
`~/.ssh/id_rsa` 是你生成的 SSH 密钥的路径。
::

### 复制 SSH 公钥到剪贴板

```sh [sh]
pbcopy < ~/.ssh/id_rsa.pub
```

或者对于 Linux 系统：

```sh [sh]
cat ~/.ssh/id_rsa.pub | xclip -selection clipboard
```

### 测试 SSH 连接

```sh [sh]
ssh -T git@github.com
```

::

## 配置 GPG 密钥

::steps{level="3"}

### 安装 gnupg 并生成 GPG 密钥

```sh [sh]
brew install gnupg
gpg --full-generate-key
```

::collapsible
- **选择密钥类型**：默认情况下，现在的 GPG 会选择 `ECC and ECC` 。您可以直接按 `Enter` 选择默认选项，生成 `ECC` 密钥。
  ::warning
  `ECC` 密钥（如 `Ed25519` ）提供了更高的安全性和更小的密钥尺寸。但在某些旧系统或软件中，可能存在兼容性问题。如果需要最大兼容性，可以选择 `RSA and RSA` ，然后将密钥长度设置为 `4096` 位。
  ::
- **选择曲线类型**： 如果选择了 `ECC`，系统会提示您选择曲线。默认的 `Curve 25519（Ed25519）`是推荐的选项，直接按 `Enter` 即可。
- **设置密钥的有效期**： 输入 `0` 表示密钥永不过期，或者根据需要设置。
- **用户信息**： 输入您的姓名、邮箱地址（必须与 GitHub 上的邮箱一致）和可选的注释。
- **确认信息**： 检查所有信息是否正确，输入 `O` 确认。
- **设置密码短语**： 为您的密钥设置一个安全的密码短语。
::

### 查看 GPG 密钥

```sh [sh]
gpg --list-secret-keys --keyid-format LONG
```

::note

会看到类似以下的输出：

```text
[keyboxd]
----------------
sec   ed25519/密钥ID  日期 [SC]
      密钥指纹
uid           [ultimate] 姓名 <邮箱>
ssb   cv25519/子密钥ID  日期 [E]
```

::

记录下 **ed25519/** 后面的长密钥 ID。例如，`ABCD1234EFGH5678`。

### 导出并复制公钥

```sh [sh]
gpg --armor --export 密钥ID | pbcopy
```

::note

复制的内容类似于：

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----
mDMEY...
...
-----END PGP PUBLIC KEY BLOCK-----
```

::

### 配置 Git 使用 GPG 签名

```sh [sh]
git config --global user.signingkey 密钥ID
git config --global commit.gpgsign true
git config --global gpg.program $(which gpg)
git config --global --unset gpg.format
```

### 安装 pinentry-mac

pinentry 程序用于提示您输入 GPG 密钥的密码。

```sh [sh]
brew install pinentry-mac
echo "pinentry-program $(which pinentry-mac)" >> ~/.gnupg/gpg-agent.conf
killall gpg-agent
```

为避免每次提交都输入密码，可以配置 GPG 缓存密码：

```sh [sh]
code ~/.gnupg/gpg-agent.conf
```

添加以下内容，代表把密码缓存 1 小时，最大缓存时间为 2 小时。

```sh [sh]
default-cache-ttl 3600
max-cache-ttl 7200
```

重启代理：

```sh [sh]
killall gpg-agent
```

### 在 VSCode 打开 `"git.enableCommitSigning": true,` 选项。

![VSCode GPG 设置](/images/tools/editors/vscode/git-vscode-gpg.png)

::

## 常用命令

| 命令                                                 | 功能说明                                         |
| ---------------------------------------------------- | ------------------------------------------------ |
| `git config --global -l`                             | 查看所有配置                                     |
| `git config --global user.name`                     | 查看某个特定的全局配置项                                     |
| `git rebase --abort`                                 | 取消变基操作                                     |
| `git branch \| grep -v "^\*" \| xargs git branch -D` | 删除除当前分支外的所有分支                       |
| `git branch \| xargs git branch -D`                  | 删除所有本地分支，包括当前分支                   |
| `git fetch --prune`                                  | 从远程仓库获取最新的代码，并删除已经被删除的分支 |
| `git branch -m <old_branch> <new_branch>`            | 重命名本地分支                                   |
| `git push origin --delete <branch_name>`             | 删除远程分支                                     |

## 常见问题

::code-preview

::accordion

  :::accordion-item{label="RPC failed; HTTP 500 curl 22 The requested URL returned error: 500" icon="i-lucide-circle-help"}

  原因：使用 http 协议进行传输的缓存区太小
  ```sh [sh]
  git config --global http.postBuffer 524288000
  ```
  ::tip
  将缓存区提高到500MB或者更高，看自己的项目需要。
  ::

  :::

::

::
