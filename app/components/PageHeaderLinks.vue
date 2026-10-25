<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const { locale, t } = useI18n()
const route = useRoute()
const toast = useToast()
const { copy, copied } = useClipboard()

const slug = computed(() => {
  const path = route.path.startsWith(`/${locale.value}`)
    ? route.path
    : `/${locale.value}${route.path}`
  return path.replace(/^\//, '')
})
const origin = import.meta.client ? window.location.origin : ''
const mdPath = computed(() => `${origin}/raw/${slug.value}.md`)

const items = computed(() => [
  {
    label: t('copy.markdownLink'),
    icon: 'i-lucide-link',
    onSelect() {
      copy(mdPath.value)
      toast.add({
        title: t('copy.copied'),
        icon: 'i-lucide-check-circle'
      })
    }
  },
  {
    label: t('copy.viewMarkdown'),
    icon: 'i-lucide-external-link',
    onSelect() {
      window.open(`${window.location.origin}/raw/${slug.value}.md`, '_blank')
    }
  }
])

async function copyPage() {
  copy(await $fetch<string>(`/raw/${slug.value}.md`))
}
function printPage() {
  window.print()
}
</script>

<template>
  <UFieldGroup data-print-hide>
    <UButton
      :label="t('copy.print')"
      icon="i-lucide-printer"
      color="neutral"
      variant="outline"
      @click="printPage"
    />
    <UButton
      :label="t('copy.page')"
      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
      color="neutral"
      variant="outline"
      :ui="{
        leadingIcon: [copied ? 'text-primary' : 'text-muted', 'size-3.5']
      }"
      @click="copyPage"
    />
    <UDropdownMenu
      :items="items"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8
      }"
      :ui="{
        content: 'w-48'
      }"
    >
      <UButton
        icon="i-lucide-chevron-down"
        size="sm"
        color="neutral"
        variant="outline"
        :aria-label="t('copy.openMenu')"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
