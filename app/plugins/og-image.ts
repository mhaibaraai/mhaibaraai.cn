// 文档页由 layer 生成 OG 图片；其余页面回退到站点通用图
export default defineNuxtPlugin(() => {
  useSeoMeta({ ogImage: '/og-image.png' }, { tagPriority: 'low' })
})
