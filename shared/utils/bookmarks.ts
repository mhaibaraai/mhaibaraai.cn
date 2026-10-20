import type { BookmarkCategory, BookmarkItem } from '../schemas/bookmarks'

export interface BookmarkFilter {
  query?: string
  category?: string
  /** 起始页展示 unlisted 条目，公开书签页不展示 */
  includeUnlisted?: boolean
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function faviconUrl(url: string): string {
  return `https://icons.duckduckgo.com/ip3/${new URL(url).hostname}.ico`
}

function matches(item: BookmarkItem, query: string): boolean {
  const haystack = [item.title, item.description, hostOf(item.url), ...(item.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

/** 按分类、关键词过滤书签并按 order 排序，返回新数组 */
export function filterBookmarks(categories: readonly BookmarkCategory[], filter: BookmarkFilter = {}): BookmarkCategory[] {
  const query = filter.query?.trim().toLowerCase() ?? ''

  return [...categories]
    .filter(category => !filter.category || category.title === filter.category)
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      ...category,
      items: category.items.filter(item =>
        (filter.includeUnlisted || !item.unlisted) && (!query || matches(item, query))
      )
    }))
    .filter(category => category.items.length > 0)
}
