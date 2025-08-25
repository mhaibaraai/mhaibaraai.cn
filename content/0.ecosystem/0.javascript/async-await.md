---
title: 异步编程
description: 深入理解 Promise 和 async/await 异步编程模式
---

## Promise

`Promise` 是一个对象，代表一个尚未完成但最终会完成（或失败）的异步操作的结果。它有三种状态：

- **Pending (进行中)**: 初始状态，既不是成功，也不是失败。
- **Fulfilled (已成功)**: 意味着操作成功完成。
- **Rejected (已失败)**: 意味着操作失败。

::warning
`Promise` 的状态一旦从 `Pending` 变为 `Fulfilled` 或 `Rejected`，就不可再改变。这确保了异步结果的稳定性和一致性。
::

```ts [promise-demo.ts]
// 创建一个 Promise，模拟一个耗时 1 秒的异步操作
const myPromise = new Promise((resolve, reject) => {
  console.log('Promise 开始执行')
  setTimeout(() => {
    // 模拟成功，并返回结果
    resolve('操作成功')
    // 以下调用将被忽略，因为 Promise 状态已确定
    // reject('操作失败');
  }, 1000)
})

// 使用 .then() 处理成功情况，.catch() 处理失败情况
myPromise
  .then((result) => {
    // result 的值是 '操作成功'
    console.log(`成功: ${result}`)
  })
  .catch((error) => {
    // 如果 Promise 被 reject，这里会执行
    console.error(`失败: ${error}`)
  })
  .finally(() => {
    // 无论成功还是失败，都会执行
    console.log('Promise 执行完毕')
  })
```

## Async/Await

`async/await` 是基于 `Promise` 的语法糖，它让异步代码看起来和同步代码一样直观易读。

- **`async` 函数**: `async` 关键字用于声明一个异步函数。该函数会隐式地返回一个 `Promise`。
- **`await` 操作符**: `await` 关键字只能在 `async` 函数内部使用，它会暂停函数的执行，等待一个 `Promise` 被 `resolve`，然后返回 `Promise` 的结果。如果 `Promise` 被 `reject`，它会抛出异常。

```ts [async-await-demo.ts]
// 定义一个返回 Promise 的函数
function delayedMessage(message, delay) {
  return new Promise(resolve => setTimeout(() => resolve(message), delay))
}

// 使用 async/await 调用
async function greet() {
  console.log('开始打招呼...')
  try {
    const message = await delayedMessage('你好，世界！', 2000)
    console.log(message) // 2秒后输出: 你好，世界！
  }
  catch (error) {
    console.error('打招呼时发生错误:', error)
  }
  finally {
    console.log('打招呼流程结束。')
  }
}

greet()
```

::tip
使用 `try...catch` 结构来处理 `await` 可能抛出的错误，这比 `.catch()` 链式调用更符合传统同步代码的错误处理逻辑。
::

## 并行与串行执行

借助 `Promise` 的能力，我们可以灵活控制多个异步操作的执行顺序。

### 串行执行

使用 `await` 可以轻松实现异步操作的串行执行，即一个操作完成后再开始下一个。

```ts [serial-execution.ts]
async function serialTasks() {
  console.time('serialTasks')
  console.log('开始执行串行任务')

  const result1 = await delayedMessage('任务1完成', 1000)
  console.log(result1)

  const result2 = await delayedMessage('任务2完成', 1000)
  console.log(result2)

  console.log('串行任务全部完成')
  console.timeEnd('serialTasks') // 大约 2000ms
}

serialTasks()
```

### 并行执行

当多个异步操作互不依赖时，使用 `Promise.all()` 可以让它们并行执行，从而提高效率。`Promise.all()` 接收一个 `Promise` 数组，当所有 `Promise` 都成功时，它会返回一个包含所有结果的数组。

```ts [parallel-execution.ts]
async function parallelTasks() {
  console.time('parallelTasks')
  console.log('开始执行并行任务')

  const tasks = [
    delayedMessage('任务A完成', 1000),
    delayedMessage('任务B完成', 1500)
  ]

  try {
    const results = await Promise.all(tasks)
    console.log('并行任务全部完成:', results) // ['任务A完成', '任务B完成']
  }
  catch (error) {
    console.error('并行任务中出现错误:', error)
  }

  console.timeEnd('parallelTasks') // 大约 1500ms
}

parallelTasks()
```
