import { queryCollection } from '@nuxt/content/server'

const SECTIONS = [
  { title: '笔记', collection: 'docs' },
  { title: '配置', collection: 'config' }
] as const

/**
 * 替代 @nuxt/content 内置的 llms 集成：其 stringifyMarkdown 在部分笔记上会栈溢出，
 * 这里直接输出原始 Markdown
 */
export default defineNitroPlugin((nitroApp) => {
  const query = (event: Parameters<typeof queryCollection>[0], collection: typeof SECTIONS[number]['collection']) =>
    queryCollection(event, collection)
      .where('path', 'NOT LIKE', '%/.navigation')
      .select('path', 'title', 'description', 'rawbody', 'stem')
      .order('stem', 'ASC')
      .all()

  nitroApp.hooks.hook('llms:generate', async (event, options) => {
    for (const { title, collection } of SECTIONS) {
      const docs = await query(event, collection)
      options.sections.push({
        title,
        links: docs.map(doc => ({ title: doc.title, description: doc.description, href: `${options.domain}${doc.path}` }))
      })
    }
  })

  nitroApp.hooks.hook('llms:generate:full', async (event, options, contents) => {
    for (const { collection } of SECTIONS) {
      const docs = await query(event, collection)
      contents.push(...docs.map(doc => toLlmsDocument(doc, options.domain)))
    }
  })
})
