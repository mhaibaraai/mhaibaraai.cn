---
title: 浙政钉开发
description: 浙政钉开发实用技巧
---

## H5 应用 Console 调试功能

浙政钉 `H5` 应用开发中，为了方便调试，可以在页面中加入 `VConsole` 调试工具，方便查看日志、调试代码。

::tip{to="https://github.com/Tencent/vConsole/tree/master"}
vConsole 是一个轻量、可拓展、针对手机网页的前端开发者调试面板
::

::code-group

```sh [pnpm]
pnpm add vconsole
```

```sh [npm]
npm install vconsole
```

::

::code-group

```ts [pc.ts]
import VConsole from 'vconsole'

const vConsole = null

// 当鼠标按下中键时，显示vConsole，结束后销毁
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 123) {
    if (!vConsole)
      vConsole = new VConsole()
    else if (vConsole)
      vConsole.destroy()
  }
})
```

```ts [ios-android.ts]
const vConsole = null
const pressTimer = null

function handleTouchStart() {
  pressTimer = setTimeout(() => {
    if (!vConsole)
      vConsole = new VConsole()
    else if (vConsole)
      vConsole.destroy()
  }, 3000) // 长按时间阈值
}

function handleTouchEnd() {
  clearTimeout(pressTimer)
}
```

::

## 浙政钉应用埋点

::tip{to="https://wetx6c6wxe.feishu.cn/wiki/wikcnu9v1TpnP34dShwEyPzNife"}
浙政钉埋点文档
::

埋点需要三个参数:

- `sapp_name` ：应用标识
- `bid` ：`sapp_name`\_zzdpro
- `sapp_id` ：应用ID（可以去浙政钉支持群咨询）、[官网查看埋点参数](https://yida-pro.ding.zj.gov.cn/alibaba/web/APP_VTZ4TZZSGZXB37IUIUM6/inst/homepage/#/REPORT-GWLBVYNV25OXGEY68AOOWR7GIXSVZ2B75HH1SLC6)

::code-tree{default-value="app/permission.ts" expand-all}

```ts [app/permission.ts]
import aplus_push from './gdt_aplus'

router.beforeEach(async (to, from, next) => {
  if (token) {
    /** 开始埋点 */
    const { meta: { title }, path, fullPath } = to
    const pageId = (path.replace('/', '') || 'app').toUpperCase()
    const userId = userStore.getUserInfo()?.dingId
    aplus_push(pageId, title as string, fullPath, userId)
    /** 结束埋点 */
  }
})
```

```ts [app/gdt_aplus.ts]
// 浙政钉应用配置信息
const gdt_config = {
  sapp_id: 'xxx', // 43832
  sapp_name: 'xxx', // gxq_msgd01
}
/**
 * 浙政钉埋点-流量分析代码（基础埋点、用户信息埋点）
 * @param page_id 页面ID, 保证唯一性
 * @param page_name 页面名称
 * @param page_url 页面 url
 * @param _user_id 用户id
 * 浙政钉-H5&小程序应用采集开发手册文档：
 * https://www.yuque.com/sisialing/bcg47r/ywfbnk?#YmwM5
 */
export default function aplus_queue_push(
  page_id: number | string,
  page_name = 'app',
  page_url: string,
  _user_id: number | string,
) {
  /**
   * 基础埋点
   */
  // 单页应用或“单个页面”需异步补充PV日志参数还需进行如下埋点：
  window.aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['aplus-waiting', 'MAN'],
  })
  // 单页应用路由切换后或在异步获取到pv日志所需的参数后再执行sendPV：
  window.aplus_queue.push({
    action: 'aplus.sendPV',
    arguments: [
      {
        is_auto: false,
      },
      {
        // 当前你的应用信息，此两行按应用实际参数修改，不可自定义。
        sapp_id: gdt_config.sapp_id,
        sapp_name: gdt_config.sapp_name,
        // 自定义PV参数key-value键值对（只能是这种平铺的json，不能做多层嵌套）
        page_id,
        page_name,
        page_url,
      },
    ],
  })
  /**
   * 用户信息埋点
   */
  // 如采集用户信息是异步行为需要先执行这个BLOCK埋点
  window.aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['_hold', 'BLOCK'],
  })
  // 用户ID
  window.aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['_user_id', _user_id],
  })
  // 如采集用户信息是异步行为，需要先设置完用户信息后再执行这个START埋点
  // 此时被block住的日志会携带上用户信息逐条发出
  window.aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['_hold', 'START'],
  })
}
```

```html [index.html]
<!-- 稳定性监控- wpkReporter.js -->
<script src="https://wpkgate-emas.ding.zj.gov.cn/static/wpk-jssdk.1.0.2/wpkReporter.js" crossorigin="true"></script>
<script>
  // 稳定性监控代码
  try {
    const config = {
      bid: 'gxq_msgd01_zzdpro',
      signkey: '1234567890abcdef',
      gateway: 'https://wpkgate-emas.ding.zj.gov.cn',
    }
    const wpk = new wpkReporter(config)
    wpk.installAll()
    window._wpk = wpk
  } catch (err) {
    console.error('WpkReporterinitfail', err)
  }
  // 流量分析-通用采集sdk
  ;(function (w, d, s, q, i) {
    w[q] = w[q] || []
    const f = d.getElementsByTagName(s)[0],
      j = d.createElement(s)
    j.async = true
    j.id = 'beacon-aplus'
    j.src = 'https://alidt.alicdn.com/alilog/mlog/aplus_cloud.js'
    f.parentNode.insertBefore(j, f)
  })(window, document, 'script', 'aplus_queue')
  aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['aplus-rhost-v', 'alog-api.ding.zj.gov.cn'],
  })
  aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['aplus-rhost-g', 'alog-api.ding.zj.gov.cn'],
  })
  const u = navigator.userAgent
  const isAndroid = u.indexOf('Android') > -1
  const isIOS = !!u.match(/\(i[^;]+;(U;)?CPU.+MacOSX/)
  aplus_queue.push({
    action: 'aplus.setMetaInfo',
    arguments: ['appId', isAndroid ? '28302650' : isIOS ? '28328447' : '47130293'],
  })
</script>

```

```html [index-multi.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      html,
      body {
        height: 100%;
        width: 100%;
        overflow: hidden;
      }

      :root {
        box-sizing: border-box;
      }

      *,
      ::before,
      ::after {
        margin: 0;
        padding: 0;
        box-sizing: inherit;
        /* ←---- 告诉 其他 所有 元素 和 伪 元素 继承 其 盒 模型 */
      }
    </style>
  </head>

  <body></body>
  <script>
    function getUrlSearch(name) {
      // 未传参，返回空
      if (!name) return null
      // 查询参数：先通过search取值，如果取不到就通过hash来取
      var after = window.location.search
      after = after.substr(1) || window.location.hash.split('?')[1]
      // 地址栏URL没有查询参数，返回空
      if (!after) return null
      // 如果查询参数中没有"name"，返回空
      if (after.indexOf(name) === -1) return null

      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      // 当地址栏参数存在中文时，需要解码，不然会乱码
      var r = decodeURI(after).match(reg)
      // 如果url中"name"没有值，返回空
      if (!r) return null
      return r[2]
    }
    function isMobile() {
      if (
        window.navigator.userAgent.match(
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
        )
      ) {
        return true // 移动端
      } else {
        return false // PC端
      }
    }
    //判断后的操作
    function changeProject() {
      const res = getUrlSearch('type')
      console.log('res', res)
      if (res === 'pc') {
        window.location.href = './pc/index.html'
      } else if (res === 'mobile') {
        window.location.href = './mobile/index.html'
      } else {
        window.location.href = './pc/index.html'
      }
    }

    if (window.navigator.userAgent) {
      if (isMobile()) {
        location.href = './mobile/index.html'
        // 判断true跳转到这个主页
      } else {
        location.href = './pc/index.html'
        // 判断false跳转到这个主页
      }
    } else {
      changeProject()
    }
  </script>
</html>

```

::
