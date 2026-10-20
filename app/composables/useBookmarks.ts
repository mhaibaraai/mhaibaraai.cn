import type { BookmarkCategory } from '~~/shared/schemas/bookmarks'

export function useBookmarks() {
  return useAsyncData('bookmarks', () => queryCollection('bookmarks').all(), {
    transform: (rows): BookmarkCategory[] => rows.map(({ title, icon, order, description, items }) => ({ title, icon, order, description, items })),
    default: (): BookmarkCategory[] => []
  })
}
