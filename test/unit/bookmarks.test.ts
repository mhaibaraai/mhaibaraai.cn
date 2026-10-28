import { describe, expect, it } from 'vitest'
import { bookmarkCategorySchema } from '~~/shared/schemas/bookmarks'
import type { BookmarkCategory } from '~~/shared/schemas/bookmarks'
import { faviconUrl, filterBookmarks, hostOf } from '~~/shared/utils/bookmarks'

const categories: BookmarkCategory[] = [
  {
    title: '学习',
    icon: 'i-lucide-graduation-cap',
    order: 2,
    items: [
      { title: 'MDN', url: 'https://developer.mozilla.org', description: 'Web 文档', tags: ['docs'] },
      { title: '内部课程', url: 'https://example.com/course', unlisted: true }
    ]
  },
  {
    title: '娱乐',
    icon: 'i-lucide-tv',
    order: 1,
    items: [{ title: 'Bilibili', url: 'https://www.bilibili.com', tags: ['video'] }]
  }
]

describe('filterBookmarks', () => {
  it('按 order 排序并隐藏 unlisted 项', () => {
    const result = filterBookmarks(categories)
    expect(result.map(c => c.title)).toEqual(['娱乐', '学习'])
    expect(result[1]!.items.map(i => i.title)).toEqual(['MDN'])
  })

  it('includeUnlisted 时保留全部条目', () => {
    const result = filterBookmarks(categories, { includeUnlisted: true })
    expect(result[1]!.items).toHaveLength(2)
  })

  it('按标题、描述、标签、域名模糊匹配，并移除空分类', () => {
    expect(filterBookmarks(categories, { query: 'web' }).flatMap(c => c.items.map(i => i.title))).toEqual(['MDN'])
    expect(filterBookmarks(categories, { query: 'VIDEO' }).map(c => c.title)).toEqual(['娱乐'])
    expect(filterBookmarks(categories, { query: 'mozilla' })).toHaveLength(1)
    expect(filterBookmarks(categories, { query: '不存在' })).toEqual([])
  })

  it('按分类过滤', () => {
    expect(filterBookmarks(categories, { category: '学习' }).map(c => c.title)).toEqual(['学习'])
  })

  it('不修改输入', () => {
    const snapshot = structuredClone(categories)
    filterBookmarks(categories, { query: 'mdn' })
    expect(categories).toEqual(snapshot)
  })
})

describe('hostOf / faviconUrl', () => {
  it('提取去掉 www 的主机名', () => {
    expect(hostOf('https://www.bilibili.com/v/popular')).toBe('bilibili.com')
    expect(hostOf('not a url')).toBe('')
  })

  it('生成 favicon 地址', () => {
    expect(faviconUrl('https://github.com/nuxt')).toBe('https://icons.duckduckgo.com/ip3/github.com.ico')
  })
})

describe('bookmarkCategorySchema', () => {
  it('拒绝非 http(s) 链接与空分类', () => {
    expect(bookmarkCategorySchema.safeParse({ ...categories[0], items: [{ title: 'x', url: 'javascript:alert(1)' }] }).success).toBe(false)
    expect(bookmarkCategorySchema.safeParse({ ...categories[0], items: [] }).success).toBe(false)
    expect(bookmarkCategorySchema.safeParse(categories[0]).success).toBe(true)
  })
})
