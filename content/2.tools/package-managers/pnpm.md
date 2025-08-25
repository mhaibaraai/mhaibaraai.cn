---
title: Pnpm
description: pnpm 的配置和使用指南。
---

## 安装

::code-group

```sh [npm]
npm install -g pnpm
```

```sh [sh]
brew install pnpm
```

::

## 工作空间

`pnpm-workspace.yaml` 定义了工作空间的根目录，并能够使您从工作空间中包含 `/` 排除目录。默认情况下，包含所有子目录。

```yaml [pnpm-workspace.yaml]
packages:
  - packages/*
  - docs
  - packages/playground/**
```

## 常用命令

| 命令 | 描述 |
| --- | --- |
| `pnpm install` | 安装依赖 |
| `pnpm store prune` | 清理缓存 |
