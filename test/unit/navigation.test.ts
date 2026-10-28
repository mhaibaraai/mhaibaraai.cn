import type { ContentNavigationItem } from '@nuxt/content'
import { describe, expect, it } from 'vitest'
import { findSectionTitle, toNoteSections } from '~/utils/navigation'

const navigation: ContentNavigationItem[] = [
  {
    title: 'Vue',
    path: '/docs/vue',
    icon: 'i-tabler-brand-vue',
    description: 'Vue 技巧',
    children: [
      { title: '踩坑', path: '/docs/vue/troubleshooting', children: [{ title: '常见问题', path: '/docs/vue/troubleshooting/common' }] },
      { title: '自动导入', path: '/docs/vue/auto-import' }
    ]
  },
  { title: 'Java', path: '/docs/java', children: [] }
]

describe('toNoteSections', () => {
  it('递归统计叶子笔记并取第一篇', () => {
    expect(toNoteSections(navigation)[0]).toEqual({
      title: 'Vue',
      path: '/docs/vue',
      icon: 'i-tabler-brand-vue',
      description: 'Vue 技巧',
      count: 2,
      firstPath: '/docs/vue/troubleshooting/common'
    })
  })

  it('空分类视自身为一篇', () => {
    expect(toNoteSections(navigation)[1]!.count).toBe(1)
    expect(toNoteSections()).toEqual([])
  })
})

describe('findSectionTitle', () => {
  it('按路径前缀匹配顶层分类', () => {
    expect(findSectionTitle(navigation, '/docs/vue/auto-import')).toBe('Vue')
    expect(findSectionTitle(navigation, '/docs/vuex/x')).toBeUndefined()
    expect(findSectionTitle(undefined, '/docs/vue/x')).toBeUndefined()
  })
})
