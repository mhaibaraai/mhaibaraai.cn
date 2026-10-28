import { z } from 'zod'

const link = z.url({ protocol: /^https?$/ })

export const usesSchema = z.object({
  groups: z.array(z.object({
    title: z.string(),
    icon: z.string(),
    items: z.array(z.object({
      name: z.string(),
      description: z.string(),
      url: link.optional(),
      icon: z.string().optional()
    }))
  }))
})

export const projectsSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
    description: z.string(),
    url: link.optional(),
    icon: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional()
  }))
})

export const shelfSchema = z.object({
  items: z.array(z.object({
    title: z.string(),
    type: z.enum(['book', 'movie', 'series', 'music', 'game']),
    status: z.enum(['done', 'doing', 'todo']),
    date: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
    creator: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    note: z.string().optional(),
    url: link.optional()
  }))
})

export const friendsSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    url: link,
    description: z.string(),
    avatar: link.optional()
  }))
})
