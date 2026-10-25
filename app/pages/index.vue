<script setup lang="ts">
import type { PageCollections } from '@nuxt/content'

const { locale, t } = useI18n()

const { data: page } = await useAsyncData('index-' + locale.value, () => queryCollection('landing_' + locale.value as keyof PageCollections).first())
if (!page.value) {
  throw createError({ status: 404, statusText: t('empty.page'), fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
    :prose="false"
    :components="{ a: 'prose-a' }"
  />
</template>
