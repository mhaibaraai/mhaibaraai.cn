---
title: DigitalOcean
description: DigitalOcean 使用指南
---

## 创建配置 Droplets

创建 Droplets 的入口：

![创建入口](/images/guides/deployment/digitalocean/create-entry.png)

创建 Droplets 的配置：

![创建 Droplets 配置](/images/guides/deployment/digitalocean/create-droplets-config.png)

## Droplets 仪表盘

管理界面仪表盘：

![Droplets 仪表盘](/images/guides/deployment/digitalocean/droplets-dashboard.png)

## SSH 登录

使用 `your_ipv4_address` IP 地址进行 SSH 连接：

```sh [sh]
ssh root@your_ipv4_address
```

### 系统更新提示

::note

当看到以下更新提示时：

```text [log]
107 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable
```
::

这是 **Ubuntu** 或 **Debian** 系 Linux 系统在执行 `sudo apt update` 或类似命令后给出的信息。

最优做法如下（一步到位）：

```sh [sh]
sudo apt update
sudo apt upgrade -y
```

完成后重启系统：

```sh [sh]
sudo reboot
```

## SSH 密钥配置

::note{to="https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/"}
参考官方文档
::

::steps{level="3"}

### 创建 SSH 密钥

```sh [sh]
ssh-keygen
```

### 获取公钥内容

```sh [sh]
cat ~/.ssh/id_ed25519.pub
```

::note
复制输出内容，格式类似：

```text [log]
ssh-ed25519 EXAMPLEzaC1lZDI1NTE5AAAAIGKy65/WWrFKeWdpJKJAuLqev9bb9ZNofcMrR/OnC9BM username@203.0.113.0
```
::

### 配置 SSH 密钥

在 Droplet 上，创建 `~/.ssh` 目录（如果不存在）：

```sh [sh]
mkdir -p ~/.ssh
```

::note
将 SSH 密钥添加到 `~/.ssh/authorized_keys` 文件中，替换引号中的示例键：

```text [log]
echo "ssh-ed25519 EXAMPLEzaC1yc2E...GvaQ== username@203.0.113.0" >> ~/.ssh/authorized_keys
```
::

设置正确的权限：

```sh [sh]
chmod -R go= ~/.ssh
chown -R $USER:$USER ~/.ssh
```

### 测试 SSH 连接

```sh [sh]
ssh root@your_ipv4_address
```

::warning
一定要关闭任何 **VPN** 或 **代理**，否则会连接失败：

```text [log]
ssh root@your_ipv4_address
Connection closed by your_ipv4_address port 22
```
::

::

## 安装 Docker 环境

::note{to="/guides/deployment/docker"}
参考 Docker 安装和使用指南
::
