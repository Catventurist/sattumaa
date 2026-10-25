<script setup lang="ts">
import type { WinKey } from '~/composables/useWin'

interface Props {
  channel: string
  icon: string
  to?: string
  app?: WinKey
}

const { channel, icon, to = '', app = undefined } = defineProps<Props>()

const emit = defineEmits<{
  launch: []
}>()

const { t } = useI18n()
const toast = useToast()

async function copy() {
  await navigator.clipboard.writeText(to)
  toast.add({
    title: t('communication.copied'),
    icon: 'i-lucide-check',
    color: 'success'
  })
}
</script>

<template>
  <div class="flex items-center gap-1 border-inverted/60 bg-primary/20 p-2 hover:bg-info/20">
    <UUser
      :to="to || undefined"
      :target="to ? '_blank' : undefined"
      :name="t(`communication.names.${channel}`)"
      :description="t(`communication.channels.${channel}`)"
      :avatar="{ icon, color: 'info' }"
      class="min-w-0 flex-1"
    />
    <UButton
      v-if="app"
      square
      size="md"
      color="info"
      variant="outline"
      icon="i-lucide-app-window"
      type="button"
      :aria-label="t('communication.openApp')"
      class=""
      @click.stop.prevent="emit('launch')"
    />
    <UButton
      v-if="to"
      square
      size="md"
      color="neutral"
      variant="outline"
      icon="i-lucide-copy"
      :aria-label="t('communication.copy')"
      class=" hover:bg-success/20"
      @click="copy"
    />
  </div>
</template>
