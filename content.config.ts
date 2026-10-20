import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { z } from 'zod'
import { bookmarkCategorySchema } from './shared/schemas/bookmarks'
import { friendsSchema, projectsSchema, shelfSchema, usesSchema } from './shared/schemas/profile'

const sitemap = defineSitemapSchema({ z })

const pageLink = z.object({
  label: z.string(),
  icon: z.string().optional(),
  to: z.string(),
  target: z.enum(['_blank', '_self']).optional()
})

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**',
      schema: z.object({
        sitemap,
        rawbody: z.string(),
        links: z.array(pageLink).optional(),
        /** 构建时由 git 提交时间注入，可在 frontmatter 中手动覆盖 */
        date: z.string().optional(),
        navigation: z.union([
          z.boolean(),
          z.object({ title: z.string().optional(), icon: z.string().optional() })
        ]).optional()
      })
    }),
    config: defineCollection({
      type: 'page',
      source: 'config/**',
      schema: z.object({
        sitemap,
        icon: z.string().optional(),
        date: z.string().optional()
      })
    }),
    now: defineCollection({
      type: 'page',
      source: 'now.md',
      schema: z.object({
        date: z.string()
      })
    }),
    bookmarks: defineCollection({
      type: 'data',
      source: 'bookmarks/*.yml',
      schema: bookmarkCategorySchema
    }),
    uses: defineCollection({ type: 'data', source: 'uses.yml', schema: usesSchema }),
    projects: defineCollection({ type: 'data', source: 'projects.yml', schema: projectsSchema }),
    shelf: defineCollection({ type: 'data', source: 'shelf.yml', schema: shelfSchema }),
    friends: defineCollection({ type: 'data', source: 'friends.yml', schema: friendsSchema })
  }
})
