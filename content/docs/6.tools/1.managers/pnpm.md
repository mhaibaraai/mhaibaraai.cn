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
