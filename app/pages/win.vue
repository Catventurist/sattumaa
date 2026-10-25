<script setup lang="ts">
definePageMeta({
  layout: 'wind'
})

const { t } = useI18n()

useSeoMeta({
  title: () => t('pages.win.title'),
  description: () => t('pages.win.description'),
  ogTitle: () => t('pages.win.title'),
  ogDescription: () => t('pages.win.description')
})
</script>

<template>
  <div class="h-screen" />
</template>
