import { z } from 'zod/v4'

export const PageSchema = z.object({
  title: z.string(),
  authors: z.array(z.object({
    name: z.string(),
    avatar: z.string().optional(),
    role: z.enum(['owner', 'editor', 'translator']).default('editor')
  })).default([])
})

export type AuthRole = 'owner' | 'editor' | 'translator'

export interface Author {
  name: string
  avatar?: string
  role: AuthRole
}

export interface PageMeta {
  title: string
  description?: string
  layout: 'default' | 'docs'
  draft: boolean
  updatedAt: string
  authors: Author[]
  [key: string]: string | number | boolean | Author[] | undefined
}

export interface Page {
  slug: string
  meta: PageMeta
  body: string
}
