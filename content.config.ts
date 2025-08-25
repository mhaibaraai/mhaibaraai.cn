import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

function createButtonSchema() {
  return z.object({
    label: z.string(),
    icon: z.string().optional(),
    to: z.string().optional(),
    color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(),
    size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
    variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional(),
    target: z.enum(['_blank', '_self']).optional(),
  })
}

function createLinkSchema() {
  return z.object({
    label: z.string(),
    icon: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    to: z.string(),
    target: z.string().optional(),
  })
}

export default defineContentConfig({
  collections: {
    landing: defineCollection(asSeoCollection({
      type: 'page',
      source: 'index.md',
      schema: z.object({
        hero: z.object({
          links: z.array(createButtonSchema()),
        }),
        section: z.object({
          title: z.string(),
          description: z.string(),
        }),
      }),
    })),
    docs: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: '**',
          exclude: ['index.md'],
        },
        schema: z.object({
          links: z.array(createLinkSchema()),
        }),
      }),
    ),
  },
})
