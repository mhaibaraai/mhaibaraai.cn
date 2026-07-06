---
title: CSRF 防护（nuxt-csurf）
description: 使用 nuxt-csurf 模块与 useCsrf 组合式函数，为 Nuxt 应用的写操作接口添加双提交 Cookie 防护。
links:
  - label: nuxt-csurf
    icon: i-simple-icons-nuxt
    to: https://github.com/Morgbn/nuxt-csurf
    target: _blank
---

`nuxt-csurf` 是一个开箱即用的 CSRF（跨站请求伪造）防护模块，通过「双提交 Cookie」（double submit cookie）模式保护会修改服务端状态的接口。

## 注册模块

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-csurf']
})
```

模块启用后，服务端中间件会自动为每个会话签发一个 CSRF token，写入 `httpOnly` Cookie，同时通过响应头将明文 token 暴露给客户端。

## 使用 useCsrf

```ts
const { csrf, headerName } = useCsrf()
```

| 返回值 | 说明 |
|--------|------|
| `csrf` | 当前会话的 CSRF token 字符串 |
| `headerName` | 携带 token 的请求头名称，可在模块配置中自定义，默认类似 `csrf-token` |

在发起 `POST`、`PATCH`、`DELETE` 等会修改服务端状态的请求时，将 token 放入对应请求头：

```ts
await $fetch(`/api/chats/${id}`, {
  method: 'PATCH',
  headers: { [headerName]: csrf },
  body: { title: result }
})
```

服务端中间件会拦截这些方法，比对请求头中的 token 与 Cookie 中签发的 token 是否一致，不一致则返回 `403`。

::note
`GET` 请求通常无需携带该请求头，因为 CSRF 防护只针对会改变状态的方法，`GET` 语义上应保持幂等且无副作用。
::

## 工作原理

CSRF 攻击利用浏览器「自动携带 Cookie」的特性，诱导用户在不知情的情况下向目标站点发起状态变更请求。双提交 Cookie 模式的防御思路是：服务端签发的 token 同时存在于 Cookie 和一个自定义请求头中，攻击者发起的跨站请求虽然会自动带上 Cookie，却无法读取或伪造这个请求头的值，因此会被服务端拒绝。

::tip
`useCsrf()` 每次调用都是读取已签发的 token，而非生成新 token，因此在同一次页面会话中多处调用（例如不同组件或组合式函数各自调用）拿到的值是一致的，无需担心 token 不同步的问题。
::
