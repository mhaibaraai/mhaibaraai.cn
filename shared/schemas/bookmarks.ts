import { z } from 'zod'

export const bookmarkItemSchema = z.object({
  title: z.string().min(1),
  url: z.url({ protocol: /^https?$/ }),
  description: z.string().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  /** 不在公开书签页展示，仅出现在起始页（链接仍可被公开访问，不要放敏感地址） */
  unlisted: z.boolean().optional()
})

export const bookmarkCategorySchema = z.object({
  title: z.string().min(1),
  icon: z.string(),
  order: z.number().int(),
  description: z.string().optional(),
  items: z.array(bookmarkItemSchema).min(1)
})

export type BookmarkItem = z.infer<typeof bookmarkItemSchema>
export type BookmarkCategory = z.infer<typeof bookmarkCategorySchema>
