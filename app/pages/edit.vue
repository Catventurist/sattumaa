<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const { content, download, clear } = useMarkdownDocument('my-doc', t('editor.initialContent'))

useSeoMeta({
  title: () => t('pages.edit.title'),
  description: () => t('pages.edit.description'),
  ogTitle: () => t('pages.edit.title'),
  ogDescription: () => t('pages.edit.description')
})
</script>

<template>
  <div class="relative space-y-3">
    <LazyAppEditor
      v-model="content"
      @download="download(t('editor.filename'))"
    />
    <UButton
      icon="i-lucide-trash"
      :label="t('copy.clear')"
      color="error"
      variant="ghost"
      class="z-20 absolute bottom-2 right-2 opacity-80"
      @click="clear"
    />
  </div>
</template>
