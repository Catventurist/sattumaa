<script setup lang="ts">
import type { Collections, GraphsEnCollectionItem, GraphsFiCollectionItem } from '@nuxt/content'

type GraphDoc = GraphsEnCollectionItem | GraphsFiCollectionItem

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { locale, t } = useI18n()

const id = computed(() => String(route.params.id))

const { data: doc } = await useAsyncData(
  () => `graph-${id.value}-${locale.value}`,
  async () => {
    const codes = [...new Set([locale.value, 'en'])]

    for (const code of codes) {
      const result = await queryCollection(`graphs_${code}` as keyof Collections)
        .where('stem', '=', `${code}/graphs/${id.value}`)
        .first()

      if (result) return { ...(result as GraphDoc), lang: code }
    }

    return null
  }
)

const isFallback = computed(() => !!doc.value && doc.value.lang !== locale.value)

if (!doc.value) {
  throw createError({
    status: 404,
    statusText: t('error.notFoundGraph'),
    fatal: true
  })
}

useSeoMeta({
  title: () => doc.value?.title,
  ogTitle: () => doc.value?.title,
  description: () => doc.value?.description,
  ogDescription: () => doc.value?.description
})
</script>

<template>
  <UPage v-if="doc">
    <UAlert
      v-if="isFallback"
      class="mb-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-languages"
      :title="t('graphs.fallback.title')"
      :description="t('graphs.fallback.description')"
    />
    <LazyMGraphViewer
      v-if="doc"
      :doc="doc"
    />
  </UPage>
</template>
