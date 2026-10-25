<script setup lang="ts">
import type { ContentNavigationItem, ContentEnCollectionItem, ContentFiCollectionItem, PageCollections } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const { locale, t } = useI18n()
const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData('pages-' + route.path, async () => {
  const collection = ('content_' + locale.value) as keyof PageCollections
  const content = await queryCollection(collection).path(route.path).first()
  if (!content && locale.value !== 'en') {
    return await queryCollection('content_en').path(route.path).first()
  }
  return content as ContentEnCollectionItem | ContentFiCollectionItem
}, {
  watch: [locale]
})

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('content_' + locale.value as keyof PageCollections, route.path, {
    fields: ['description']
  })
})

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description
const headline = computed(() => findPageHeadline(navigation?.value, page.value?.path))
const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: t('copy.edit'),
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
/* defineOgImage('Docs.takumi', { title, description, headline: headline.value }) */
</script>

<template>
  <div>
    <UPage v-if="page">
      <UPageHeader
        :title="page.title"
        :description="page.description"
        :headline="headline"
      >
        <template #links>
          <UButton
            v-for="(link, index) in page.links"
            :key="index"
            v-bind="link"
          />

          <PageHeaderLinks />
        </template>
      </UPageHeader>

      <UPageBody>
        <ContentRenderer
          v-if="page"
          :value="page"
        />

        <USeparator
          v-if="surround?.length"
          data-print-hide
        />

        <UContentSurround
          :surround="surround"
          data-print-hide
        />
      </UPageBody>

      <template
        v-if="page?.body?.toc?.links?.length"
        #right
      >
        <UContentToc
          :title="toc?.title"
          :links="page.body?.toc?.links"
          highlight
          highlight-color="secondary"
          highlight-variant="circuit"
        >
          <template
            v-if="toc?.bottom"
            #bottom
          >
            <div
              class="hidden lg:block space-y-6"
              :class="{ 'mt-6!': page.body?.toc?.links?.length }"
            >
              <USeparator
                v-if="page.body?.toc?.links?.length"
                type="dashed"
              />

              <UPageLinks
                :title="toc.bottom.title"
                :links="links"
              />
            </div>
          </template>
        </UContentToc>
      </template>
    </UPage>
  </div>
</template>
