<script setup lang="ts">
import type { PageCollections } from '@nuxt/content'
import * as locales from '@nuxt/ui/locale'
import { findPageChildren } from '@nuxt/content/utils'

const { locale, t } = useI18n()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

const { data: navigation } = await useAsyncData(
  () => `navigation-${locale.value}`,
  () => queryCollectionNavigation(`content_${locale.value}` as keyof PageCollections),
  { watch: [locale], default: () => [] }
)

const { data: files } = useLazyAsyncData(
  () => `search-${locale.value}`,
  () => queryCollectionSearchSections(`content_${locale.value}` as keyof PageCollections, {
    ignoredTags: ['style']
  }),
  { server: false, watch: [locale] }
)

const links = computed(() => [{
  label: t('pages.win.title'),
  icon: 'i-lucide-app-window',
  to: '/win'
},
{
  label: t('pages.demo.title'),
  icon: 'i-lucide-hexagon',
  to: '/demo'
},
{
  label: t('pages.graphs.title'),
  icon: 'i-lucide-chart-network',
  to: '/graphs'
},
{
  label: t('pages.edit.title'),
  icon: 'i-lucide-pen',
  to: '/edit'
}])

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang,
    dir
  }
})

useSeoMeta({
  titleTemplate: computed(() => `%s - ${t('site.title')}`),
  ogTitle: computed(() => t('site.title')),
  ogDescription: computed(() => t('site.description'))
})

const docsNavigation = computed(() => findPageChildren(navigation.value ?? [], `/${locale.value}`))
provide('navigation', docsNavigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="docsNavigation"
        :links="links"
        :fuse="{ resultLimit: 17, fuseOptions: { threshold: 0.1 } }"
      />
    </ClientOnly>
  </UApp>
</template>
