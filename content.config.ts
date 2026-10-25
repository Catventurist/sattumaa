import { defineContentConfig, defineCollection, property } from '@nuxt/content'
import { z } from 'zod/v4'

const graphSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: property(z.string()).editor({ input: 'icon' }),
  lanes: z.array(z.object({ id: z.string(), label: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number() })),
  nodes: z.array(z.object({ id: z.string(), label: z.string(), lane: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number() })),
  edges: z.array(z.object({ id: z.string(), from: z.string(), to: z.string(), path: z.string() })),
  walkthrough: z.object({ steps: z.array(z.object({ focus: z.array(z.string()) })) }).optional()
})

export default defineContentConfig({
  collections: {
    landing_en: defineCollection({
      type: 'page',
      source: 'en/index.md'
    }),
    landing_fi: defineCollection({
      type: 'page',
      source: 'fi/index.md'
    }),
    content_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/**',
        exclude: ['en/index.md', 'en/graphs/*']
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: property(z.string()).editor({ input: 'icon' }),
          to: z.string(),
          target: z.string().optional()
        })).optional()
      })
    }),
    content_fi: defineCollection({
      type: 'page',
      source: {
        include: 'fi/**',
        exclude: ['fi/index.md', 'fi/graphs/*']
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: property(z.string()).editor({ input: 'icon' }),
          to: z.string(),
          target: z.string().optional()
        })).optional()
      })
    }),
    graphs_en: defineCollection({
      type: 'data',
      source: 'en/graphs/**.yml',
      schema: graphSchema
    }),
    graphs_fi: defineCollection({
      type: 'data',
      source: 'fi/graphs/**.yml',
      schema: graphSchema
    })
  }
})
