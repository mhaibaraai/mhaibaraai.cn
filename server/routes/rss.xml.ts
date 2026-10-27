import { queryCollection } from '@nuxt/content/server'
import { Feed } from 'feed'

const SITE_URL = 'https://mhaibaraai.cn'

export default defineEventHandler(async (event) => {
  const notes = await queryCollection(event, 'docs')
    .where('path', 'NOT LIKE', '%/.navigation')
    .select('path', 'title', 'description', 'meta')
    .all()
    .then(data => sortNotesByDate(data).slice(0, 30))

  const feed = new Feed({
    id: SITE_URL,
    link: SITE_URL,
    title: 'YiXuan 的开发随笔',
    description: '一个专注于技术分享与知识沉淀的个人网站。',
    language: 'zh-CN',
    copyright: `© ${new Date().getFullYear()} YiXuan`,
    favicon: `${SITE_URL}/favicon.ico`,
    author: { name: 'YiXuan', link: SITE_URL }
  })

  for (const note of notes) {
    feed.addItem({
      id: `${SITE_URL}${note.path}`,
      link: `${SITE_URL}${note.path}`,
      title: note.title,
      description: note.description,
      date: new Date(noteDate(note) ?? Date.now())
    })
  }

  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return feed.rss2()
})
