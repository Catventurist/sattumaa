<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()

const notFound = computed(() => props.error.status === 404)

const translated = computed(() => {
  const statusText = notFound.value ? t('error.notFoundTitle') : t('error.genericTitle')
  return {
    ...props.error,
    statusText,
    statusMessage: statusText,
    message: notFound.value ? t('error.notFoundBody') : t('error.genericBody')
  }
})

useSeoMeta({
  title: () => translated.value.statusText,
  description: () => translated.value.message,
  robots: 'noindex'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <UError
        :error="translated"
        :clear="{ label: t('error.back'), color: 'neutral', icon: 'i-lucide-arrow-left' }"
      />
    </NuxtLayout>
  </UApp>
</template>
