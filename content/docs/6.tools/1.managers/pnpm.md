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
pnpm 10 起 `managePackageManagerVersions` 默认开启。当当前 pnpm 版本与 `package.json` 中 `packageManager` 声明的版本不一致时，pnpm 会先把目标版本装到全局目录再执行命令。这条自更新路径在 pnpm 11.12.0 上存在缺陷，会直接崩溃。
::

**典型错误信息**：

```text
[ERROR] Cannot use 'in' operator to search for 'integrity' in undefined

pnpm: Cannot use 'in' operator to search for 'integrity' in undefined
    at createFullPkgId (.../pnpm/dist/pnpm.mjs)
    at lockfileToDepGraph (.../pnpm/dist/pnpm.mjs)
    at headlessInstall (.../pnpm/dist/pnpm.mjs)
    at async installPnpmToGlobalDir (.../pnpm/dist/pnpm.mjs)
```

**关键判据**：调用栈里出现 `installPnpmToGlobalDir`，本地执行 `pnpm -v` 也报同样的错。这说明失败发生在 pnpm 自举阶段，与项目的依赖树、lockfile 完全无关，不要浪费时间去删 `node_modules` 或重新生成 lockfile。

**问题原因**：

自更新时 pnpm 会用全局环境 lockfile 重建一份依赖图，`buildLockfileFromEnvLockfile` 对带 peer 依赖的快照（形如 `fdir@6.5.0(picomatch@4.0.5)`）取不到对应的 `packages[depPath]` 条目，又没有回退到基础包，导致合并出的包对象缺少 `resolution` 块；随后 headless install 读取 `resolution.integrity`，`in` 运算符在 `undefined` 上抛出 TypeError。

上游追踪：[pnpm/pnpm#12959](https://github.com/pnpm/pnpm/issues/12959)（根因，修复 PR [#12960](https://github.com/pnpm/pnpm/pull/12960) 待合并）、[pnpm/action-setup#276](https://github.com/pnpm/action-setup/issues/276)（CI 场景）。

触发条件只有一个：**当前运行的 pnpm 版本 ≠ `packageManager` 声明的目标版本**。常见于两个场景：

1. 本地：Renovate 把 `packageManager` 从 `pnpm@11.10.0` 升到 `pnpm@11.12.0`，而本机（如 Homebrew 安装的）仍是旧版本。
2. CI：`pnpm/action-setup@v6` 会先装一个固定的 bootstrap pnpm（v11.7.0），再无条件执行 `pnpm self-update <目标版本>`。因此在 v6 上即使显式写 `with: version:` 也绕不开这条路径。

**解决方案**：

::code-group

```sh [本地：升级 pnpm]
# 让本机版本与 packageManager 对齐，直接跳过自更新路径
brew upgrade pnpm
pnpm -v   # 确认输出与 packageManager 一致
```

```yaml [CI：改用 action-setup@v5]
# v5 直接用 npm 安装目标版本，不走 self-update
- uses: pnpm/action-setup@v5
```

::

::callout{color="info"}
不要为规避此问题去改 `package.json` 或加 `.npmrc` 关闭 `managePackageManagerVersions`，保持默认行为对 CI 与本地的版本一致性更有利。Renovate 每次 bump `packageManager` 都会让本机版本落后一次，因此这个坑会周期性复现，版本对齐是常规应对。CI 侧若用 Renovate 自动升级 Actions，需要临时锁住 `pnpm/action-setup` 的 major 版本，否则会被重新顶回 v6。
::
