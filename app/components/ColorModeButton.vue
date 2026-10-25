<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()
const nextTheme = computed(() => (colorMode.value === 'dark' ? 'light' : 'dark'))

function switchTheme() {
  colorMode.preference = nextTheme.value
}

function startViewTransition(event: MouseEvent) {
  if (!document.startViewTransition) {
    switchTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const root = document.documentElement
  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`)

  document.startViewTransition(async () => {
    switchTheme()
    await nextTick()
  })
}
</script>

<template>
  <ClientOnly>
    <UButton
      :title="t('theme.mode')"
      :aria-label="t('theme.switch', { theme: t(`theme.${nextTheme}`) })"
      :icon="nextTheme === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
      color="neutral"
      variant="ghost"
      size="md"
      @click="startViewTransition"
    />
    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
