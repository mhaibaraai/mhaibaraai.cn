---
title: CSS 高级特性
description: CSS 变量、Flexbox 响应式布局等现代 CSS 特性
---

## CSS 变量

CSS 自定义属性（CSS 变量）允许我们在样式表中声明可复用的值，极大地增强了代码的灵活性和可维护性，特别是在主题切换和组件化开发中。

### 变量回退

`var()` 函数支持回退值，当主要变量未定义时，浏览器会使用第二个参数作为备用值。

```css [variable-fallback.css]
:root {
  --primary-color: red; /* 主要颜色 */
  --secondary-color: blue; /* 备用颜色 */
  /* 如果 --primary-color 未定义，则使用 --secondary-color */
  --chosen-color: var(--primary-color, var(--secondary-color));
}

.element {
  background-color: var(--chosen-color);
}
```

::tip
`var()` 函数的第二个参数是回退值，它仅在第一个变量无效或未定义时生效。
::

### 条件样式

通过属性选择器，我们可以根据 DOM 状态（如 `data-theme`）动态地改变 CSS 变量的值，从而实现主题切换等条件样式。

::code-group

```css [conditional-selection.css]
:root {
  --primary-color: red;
}

/* 当 body 具有 data-theme="primary" 属性时应用 */
body[data-theme='primary'] {
  --chosen-color: var(--primary-color);
}

.element {
  background-color: var(--chosen-color);
}
```

```html [structure.html]
<body data-theme="primary">
  <div class="element">This element has the primary color as background.</div>
</body>
```

::

## Flexbox 响应式布局

Flexbox 提供了一套强大的工具集，用于在不同屏幕尺寸下创建灵活且响应迅速的布局。

### 自适应网格

通过 `flex` 属性可以实现子元素根据容器宽度自适应排列，常用于创建响应式网格布局。

::code-group

```css [layout.css]
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 子元素之间的间距 */
}

.item {
  flex: 1 1 calc(25% - 10px); /* 基于 4 列布局，自动换行 */
  box-sizing: border-box; /* 包含 padding 和 border */
}
```

```html [structure.html]
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
</div>
```

::

::note
使用 `calc()` 函数可以精确计算包含 `gap` 在内的子元素宽度， `box-sizing: border-box` 能确保 `padding` 和 `border` 被包含在宽度计算之内，简化布局逻辑。
::
