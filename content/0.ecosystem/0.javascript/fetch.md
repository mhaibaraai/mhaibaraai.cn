---
title: 网络请求
description: 使用 fetch API 进行网络请求和数据交互
---

## 基本用法

`fetch()` 方法的第一个参数是要请求的资源的 URL。它会返回一个 `Promise`，该 `Promise` 在接收到服务器的响应头后 `resolve` 为一个 `Response` 对象。

```ts [basic-fetch.ts]
async function fetchData(url) {
  try {
    const response = await fetch(url)

    // response.ok 检查 HTTP 状态码是否在 200-299 范围内
    if (!response.ok) {
      throw new Error(`HTTP 错误！状态: ${response.status}`)
    }

    // response.json() 读取响应体并解析为 JSON
    const data = await response.json()
    console.log(data)
    return data
  }
  catch (error) {
    console.error('无法获取数据:', error)
  }
}

// 示例：从公共 API 获取用户数据
fetchData('https://jsonplaceholder.typicode.com/users/1')
```

## 处理响应

`Response` 对象提供了多种方法来处理不同格式的响应体：

- **`response.json()`**: 解析响应体为 JSON 对象。
- **`response.text()`**: 将响应体作为纯文本读取。
- **`response.blob()`**: 将响应体处理为 `Blob` 对象，用于处理图片、音频等二进制文件。
- **`response.formData()`**: 将响应体处理为 `FormData` 对象。
- **`response.arrayBuffer()`**: 将响应体处理为 `ArrayBuffer` 对象，用于处理通用的二进制数据。

## 配置请求

`fetch()` 方法可以接受第二个可选参数，一个 `init` 配置对象，用于自定义请求。

```ts [post-request.ts]
async function postData(url, data) {
  try {
    const response = await fetch(url, {
      // 请求方法
      method: 'POST',
      // 请求头
      headers: {
        'Content-Type': 'application/json'
      },
      // 请求体，必须是字符串
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP 错误！状态: ${response.status}`)
    }

    const responseData = await response.json()
    console.log('成功:', responseData)
    return responseData
  }
  catch (error) {
    console.error('无法发送数据:', error)
  }
}

// 示例：向 API 发送一个新的帖子
const newPost = {
  title: 'foo',
  body: 'bar',
  userId: 1
}

postData('https://jsonplaceholder.typicode.com/posts', newPost)
```

### `init` 对象常用选项

- **`method`**: 请求方法，如 `GET`, `POST`, `PUT`, `DELETE`。
- **`headers`**: 一个包含请求头的 `Headers` 对象或普通对象。
- **`body`**: 请求体，可以是 `Blob`, `BufferSource`, `FormData`, `URLSearchParams` 或 `ReadableStream` 对象。`GET` 或 `HEAD` 方法不能有请求体。
- **`mode`**: 请求模式，如 `cors`, `no-cors`, `same-origin`。
- **`cache`**: 缓存模式，如 `default`, `no-store`, `reload`。
- **`credentials`**: 是否发送 `cookies`，如 `include`, `same-origin`, `omit`。

## 错误处理

`fetch()` 返回的 `Promise` 只有在遇到网络故障时才会 `reject`。对于服务器返回的 HTTP 错误状态（如 404 或 500），`fetch()` **不会** `reject`。

因此，必须始终检查 `response.ok` 属性来判断请求是否成功。

```ts [error-handling.ts]
async function checkStatus(url) {
  try {
    const response = await fetch(url)

    // 对于 404 等 HTTP 错误，fetch 不会抛出异常
    // 需要手动检查状态
    if (!response.ok) {
      // 创建一个包含状态信息的错误，以便后续处理
      throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`)
    }

    console.log('请求成功！')
    const data = await response.json()
    return data
  }
  catch (error) {
    // 这里会捕获网络错误和我们手动抛出的 HTTP 状态错误
    console.error('Fetch 操作失败:', error.message)
  }
}

// 示例：请求一个不存在的资源
checkStatus('https://jsonplaceholder.typicode.com/invalid-url')
```
