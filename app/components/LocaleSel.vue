<script setup lang="ts">
import { en, fi } from '@nuxt/ui/locale'
import type { Locale } from '#i18n'

const { locale, setLocale } = useI18n()

function onLocaleChange(value: string) {
  setLocale(value as Locale)
}
</script>

<template>
  <ULocaleSelect
    :model-value="locale"
    :locales="[en, fi]"
    @update:model-value="onLocaleChange"
  />
</template>
