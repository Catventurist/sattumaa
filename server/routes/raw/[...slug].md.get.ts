import { withLeadingSlash } from 'ufo'
import { stringify } from 'minimark/stringify'
import { queryCollection } from '@nuxt/content/server'
import type { PageCollections } from '@nuxt/content'
import type { H3Event } from 'h3'

const SUPPORTED_LOCALES = ['en', 'fi']
const DEFAULT_LOCALE = 'en'

function resolveLocale(event: H3Event<globalThis.EventHandlerRequest>): string {
  const query = getQuery(event)
  if (typeof query.locale === 'string' && SUPPORTED_LOCALES.includes(query.locale)) {
    return query.locale
  }

  const acceptLanguage = getHeader(event, 'accept-language')
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0]?.split('-')[0]?.trim()
    if (preferred && SUPPORTED_LOCALES.includes(preferred)) {
      return preferred
    }
  }

  return DEFAULT_LOCALE
}

export default eventHandler(async (event) => {
  const slug = getRouterParams(event)['slug.md']
  if (!slug?.endsWith('.md')) {
    throw createError({ status: 404, statusText: 'Page not found', fatal: true })
  }

  const locale = resolveLocale(event)
  const path = withLeadingSlash(slug.replace('.md', ''))

  const collection = `content_${locale}` as keyof PageCollections
  let page = await queryCollection(event, collection).path(path).first()

  if (!page && locale !== DEFAULT_LOCALE) {
    page = await queryCollection(event, 'content_en' as keyof PageCollections).path(path).first()
  }

  if (!page) {
    throw createError({ status: 404, statusText: 'Page not found', fatal: true })
  }

  if (page.body.value[0]?.[0] !== 'h1') {
    page.body.value.unshift(['blockquote', {}, page.description])
    page.body.value.unshift(['h1', {}, page.title])
  }

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  setHeader(event, 'Content-Language', locale)
  return stringify({ ...page.body, type: 'minimark' }, { format: 'markdown/html' })
})
