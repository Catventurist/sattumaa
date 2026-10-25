<script setup lang="ts">
import type { BranchMenuItem } from '~/components/s/BranchMenu.vue'

const { t } = useI18n()

const items = computed<BranchMenuItem[]>(() => [
  {
    label: t('branchMenu.gettingStarted'),
    children: [
      { value: 'install', label: t('branchMenu.installation'), icon: 'i-lucide-download' },
      { value: 'quick', label: t('branchMenu.quickStart'), icon: 'i-lucide-rocket' },
      { value: 'config', label: t('branchMenu.configuration'), icon: 'i-lucide-settings' }
    ]
  },
  {
    label: t('branchMenu.components'),
    children: [
      { value: 'buttons', label: t('branchMenu.buttons') },
      { value: 'overlays', label: t('branchMenu.overlays') }
    ]
  }
])

/* function navigate(value: string) {
  return navigateTo(`/docs/${value}`)
} */
</script>

<template>
  <div class="relative w-full h-125 bg-default">
    <SBranchMenu
      :items="items"
      :default-open="[0]"
      default-active="quick"
      :width="240"
      :row-height="36"
      :indent="40"
      :trunk="14"
      :radius="10"
      :line-width="1.5"
      :font-size="14"
      :draw-duration="400"
      :fold-duration="300"
      @select="'navigate'"
    />
  </div>
</template>
