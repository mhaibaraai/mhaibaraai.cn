---
title: Nuxt UI componentDetection 漏检
description: 解决 @nuxt/ui 开启 componentDetection 后，部分组件主题 CSS 未生成、样式完全缺失的问题。
---

## 问题现象

::caution
某个 `@nuxt/ui` 组件能正常渲染，但样式完全缺失，尤其是依赖 CSS 状态类的交互行为失效（如折叠/展开、激活态等）。

典型特征：

- 无 JavaScript 报错，组件 DOM 结构正常
- 仅视觉/交互行为异常（如侧边栏收起后仍可见、弹层位置不对）
- 本地开发与生产构建均能复现
- 禁用 `componentDetection` 后恢复正常
::

## 定位方式

首先确认是否真的是 `componentDetection` 漏检导致的。检查 `.nuxt/ui.css` 的 `@source` 列表：

```bash
# 以 Sidebar 组件为例，查找对应主题文件是否被引入
grep "sidebar" .nuxt/ui.css
```

若输出为空，说明 `sidebar.ts` 主题文件未被纳入构建，`Sidebar` 相关的所有 CSS 类均未生成。

更通用的排查方式：直接查看 `@source` 列表中包含哪些组件：

```bash
grep "@source" .nuxt/ui.css
```

对照缺失样式的组件名，若 `./ui/<component-name>.ts` 不在列表中，即可确认是漏检问题。

## 根本原因

### componentDetection 的扫描边界

`@nuxt/ui` 的 `componentDetection` 功能通过扫描各 Layer 的 `app/` 目录来判断哪些 UI 组件被实际使用，并只为检测到的组件生成主题 CSS，以减小产物体积。

```plaintext
# 会扫描的目录（✅）
your-layer/
  app/
    components/   ← 扫描
    pages/        ← 扫描
    layouts/      ← 扫描

# 不会扫描的目录（❌）
your-layer/
  modules/
    your-module/
      runtime/
        components/   ← 不扫描
        pages/        ← 不扫描
```

当 `@nuxt/ui` 组件的实际使用位置在 `modules/*/runtime/` 目录中时，`componentDetection` 无法检测到，对应的主题文件不会出现在 `.nuxt/ui.css` 的 `@source` 列表里，相关 CSS 类从未生成。

### 同样受影响的场景

除了 `modules/` runtime，以下用法也会绕过静态扫描：

- `<component :is="dynamicComponent">` — 动态组件，编译期无法确定组件名
- 通过 `provide/inject` 或插槽间接渲染的组件
- 在 `server/` 目录中引用的 UI 组件

## 解决方案

将 `componentDetection` 从 `true` 改为显式数组，把无法被自动检测到的组件名加入其中。`app/` 目录的自动扫描仍正常进行，不影响已有组件的检测。

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  ui: {
    experimental: {
      // 将无法自动检测到的组件名加入数组
      // app/ 目录中使用的组件仍由自动扫描覆盖
      componentDetection: [
        'Sidebar',      // 替换为你实际缺失样式的组件名
        'YourWidget'
      ]
    }
  }
})
```

::tip
组件名使用 PascalCase，与 `@nuxt/ui` 组件名保持一致（去掉 `U` 前缀）。例如 `<USidebar>` 对应 `'Sidebar'`，`<UChatMessages>` 对应 `'ChatMessages'`。
::

修改后重启开发服务器，验证 `.nuxt/ui.css` 中出现对应的 `@source` 条目：

```bash
grep "sidebar" .nuxt/ui.css
# 预期输出：@source "./ui/sidebar.ts";
```

## 适用范围

满足以下任一条件的项目均可能遇到此问题：

- 使用 Nuxt Layer（`extends`），且 Layer 内有 `modules/*/runtime/` 目录中使用了 `@nuxt/ui` 组件
- 在项目中使用 `<component :is>` 动态渲染 `@nuxt/ui` 组件
- 开启了 `ui.experimental.componentDetection: true` 后发现部分组件样式缺失

::note
若你是 Nuxt Layer 的维护者，建议直接在 Layer 的 `nuxt.config.ts` 中配置数组，避免 consumer 项目逐一修补。
::
