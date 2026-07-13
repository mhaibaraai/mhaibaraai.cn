---
title: Pnpm
description: pnpm 的配置和使用指南。
---

## 安装

::code-group

```sh [corepack (推荐)]
corepack enable pnpm
corepack use pnpm@latest
```

```sh [npm]
npm install -g pnpm
```

```sh [brew]
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

## 故障排查

### 信任降级错误(Trust Downgrade)

::callout{type="warning"}
pnpm 10.21+ 引入了 `trustPolicy` 功能用于防范供应链攻击。当包的信任级别降低时(如从有来源证明降为无证明),安装会失败。
::

**典型错误信息**:

```text
ERR_PNPM_TRUST_DOWNGRADE  High-risk trust downgrade for "package-name@x.x.x" (possible package takeover)

Earlier versions had provenance attestation, but this version has no trust evidence.
```

**问题原因**:

npm 包的信任级别分为三个层次:
1. 可信发布者(Trusted Publisher) - 最高
2. 来源证明(Provenance Attestation) - 中等
3. 无证据(No Evidence) - 最低

当新版本的信任级别低于早期版本时,pnpm 认为这可能是包被劫持的信号,会阻止安装。

**常见受影响的包**:

- `undici` / `undici-types` - [相关 Issue](https://github.com/nodejs/undici/issues/4666)
- `chokidar`
- 其他未配置发布流程证明的包

**解决方案**:

在 `pnpm-workspace.yaml` 中添加信任策略例外:

```yaml [pnpm-workspace.yaml]
trustPolicy: no-downgrade
trustPolicyExclude:
  - undici
  - undici-types
  - chokidar
```

**安全建议**:

::callout{color="info"}
- 仅为知名包添加例外
- 定期检查 [GitHub Advisory Database](https://github.com/advisories) 了解已知漏洞
- 优先考虑联系包维护者配置 npm provenance
- 可参考 [pnpm 文档](https://github.com/pnpm/pnpm/issues/10329)了解更多信息
::

### 自举失败(integrity in undefined)

::callout{type="warning"}
pnpm 10 起 `managePackageManagerVersions` 默认开启。当本机 pnpm 版本与 `package.json` 中 `packageManager` 声明的版本不一致时，pnpm 会先自下载目标版本再执行命令。这条自下载路径依赖本地的注册表元数据缓存，缓存陈旧时会直接崩溃。
::

**典型错误信息**：

```text
[ERROR] Cannot use 'in' operator to search for 'integrity' in undefined
```

**关键判据**：执行 `pnpm -v` 也报同样的错。这说明失败发生在 pnpm 自举阶段，与项目的依赖树、lockfile 完全无关，不要浪费时间去删 `node_modules` 或重新生成 lockfile。

**问题原因**：

1. Renovate 之类的工具把 `packageManager` 从 `pnpm@11.10.0` 升到 `pnpm@11.12.0`，而本机（如 Homebrew 安装的）仍是 11.10.0，版本不匹配触发自下载。
2. 自下载时读取本地元数据缓存 `~/Library/Caches/pnpm/metadata-v1.3/registry.npmjs.org/pnpm.json`。这份缓存可能停留在几个月前，`dist-tags.latest` 还是旧版本，根本不含 11.12.0。
3. pnpm 访问 `versions['11.12.0'].dist.integrity`，左侧是 `undefined`，`in` 运算符抛出 TypeError。

真正的触发点是陈旧的元数据缓存，而非 `packageManager` 里的版本号写错了。

**解决方案**：

::code-group

```sh [升级本机 pnpm (推荐)]
# 让本机版本与 packageManager 对齐，直接跳过自下载路径
brew upgrade pnpm
pnpm -v   # 确认输出与 packageManager 一致
```

```sh [清理元数据缓存]
# 强制 pnpm 重新拉取注册表元数据
rm ~/Library/Caches/pnpm/metadata-v1.3/registry.npmjs.org/pnpm.json

# 担心其他包元数据也陈旧时，可整体清掉（只是缓存，会自动重建）
rm -rf ~/Library/Caches/pnpm/metadata-v1.3/
```

::

::callout{color="info"}
不要为规避此问题去改 `package.json` 或加 `.npmrc` 关闭 `managePackageManagerVersions`，保持默认行为对 CI 与本地的版本一致性更有利。Renovate 每次 bump `packageManager` 都会让本机版本落后一次，因此这个坑会周期性复现，`brew upgrade pnpm` 是常规应对。
::
