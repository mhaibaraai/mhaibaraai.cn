import { queryCollection } from '@nuxt/content/server'

/** 供 Chrome 新标签页扩展离线缓存，包含 unlisted 条目 */
export default defineEventHandler(async (event) => {
  const rows = await queryCollection(event, 'bookmarks').all()
  const categories = rows.map(({ title, icon, order, description, items }) => ({ title, icon, order, description, items }))

  setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
  return {
    updatedAt: new Date().toISOString(),
    categories: filterBookmarks(categories, { includeUnlisted: true })
  }
})
