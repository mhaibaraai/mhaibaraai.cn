import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'
import { bookmarkCategorySchema } from './shared/schemas/bookmarks'
import { friendsSchema, projectsSchema, shelfSchema, usesSchema } from './shared/schemas/profile'

// docs 集合由 @movk/nuxt-docs 定义，这里只声明站点独有的集合
export default defineContentConfig({
  collections: {
    config: defineCollection({
      type: 'page',
      source: 'config/**',
      schema: z.object({
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
