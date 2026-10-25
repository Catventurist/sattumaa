<script setup lang="ts">
import type { Collections } from '@nuxt/content'

definePageMeta({
  layout: 'default'
})

const { locale, t } = useI18n()
const route = useRoute()
const { data: graphs } = await useAsyncData('graphs-' + route.path, () =>
  queryCollection('graphs_' + locale.value as keyof Collections).select('title', 'stem').all()
)

const items = computed(() =>
  graphs.value?.map(g => ({
    title: g.title,
    to: `/graphs/${g.stem.replace(/^(en|fi)\/graphs\//, '')}`
  })) ?? []
)

useSeoMeta({
  title: () => t('pages.graphs.title'),
  description: () => t('pages.graphs.description'),
  ogTitle: () => t('pages.graphs.title'),
  ogDescription: () => t('pages.graphs.description')
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">
      {{ t('graphs.title') }}
    </h1>

    <UPageGrid v-if="items.length">
      <UPageCard
        v-for="item in items"
        :key="item.title"
        icon="i-lucide-git-pull-request"
        :title="item.title"
        :to="item.to"
        class="transition-opacity hover:opacity-80"
      />
    </UPageGrid>

    <UEmpty
      v-else
      icon="i-lucide-file-question"
      :title="t('graphs.empty')"
    />
  </div>
</template>
