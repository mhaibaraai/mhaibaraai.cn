# YiXuan Start（Chrome 新标签页扩展）

用 [mhaibaraai.cn/start](https://mhaibaraai.cn/start) 替换 Chrome 新标签页。打开新标签页时先拉取书签 JSON 并缓存，站点可达则全屏加载起始页，离线或超时则用缓存渲染极简书签列表。

## 安装

1. 打开 `chrome://extensions`，开启右上角「开发者模式」
2. 点击「加载已解压的扩展程序」，选择本目录 `extensions/newtab`
3. 新开标签页，Chrome 会询问是否保留该扩展对新标签页的更改，选择「保留」
4. 在扩展管理中停用 Infinity 新标签页

更新扩展代码后，在 `chrome://extensions` 中点击刷新按钮即可；书签内容随站点部署自动更新，无需重新加载扩展。

## Safari

Safari 不需要扩展：设置 → 通用 → 主页填写 `https://mhaibaraai.cn/start`，并将「新窗口打开方式」与「新标签页打开方式」都设为「主页」。

## 说明

- 站点通过 `Content-Security-Policy: frame-ancestors 'self' chrome-extension:` 允许被扩展内嵌
- 书签中标记为 `unlisted` 的条目只在起始页显示，但仍可通过公开 URL 访问，不要放敏感地址
