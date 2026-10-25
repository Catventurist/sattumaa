<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { WinKey } from '~/composables/useWin'

const { t, locale, locales, setLocale } = useI18n()
const { states, focus } = useWin()
const { isRunOpen, toggleRun } = useRun()

const icons: Partial<Record<string, string>> = {
  communication: 'i-lucide-radio-tower',
  jitsi: 'i-lucide-speech',
  browser: 'i-lucide-globe'
}

function launch(key: WinKey) {
  states.value[key] = 'open'
  focus(key)
  isRunOpen.value = false
}

function changeLocale(code: string) {
  setLocale(code as typeof locale.value)
  isRunOpen.value = false
}

function languageName(code: string) {
  return new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code
}

const appItems = computed<CommandPaletteItem[]>(() => {
  return (Object.keys(states.value) as WinKey[]).map(key => ({
    label: t(`taskbar.apps.${key}`),
    icon: icons[key] ?? 'i-lucide-app-window',
    suffix: states.value[key] === 'closed' ? undefined : t('run.running'),
    onSelect: () => launch(key)
  }))
})

const languageItems = computed<CommandPaletteItem[]>(() => {
  return locales.value.map((item) => {
    const code = typeof item === 'string' ? item : item.code
    return {
      label: languageName(code),
      icon: 'i-lucide-languages',
      active: code === locale.value,
      onSelect: () => changeLocale(code)
    }
  })
})

const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'apps',
    label: t('run.apps'),
    items: appItems.value
  },
  {
    id: 'language',
    label: t('run.language'),
    items: languageItems.value
  }
])

defineShortcuts({
  meta_o: toggleRun
})
</script>

<template>
  <UModal
    v-model:open="isRunOpen"
    :ui="{ content: 'bg-radial to-primary/20 backdrop-blur-sm' }"
  >
    <template #content>
      <UCommandPalette
        close
        :groups="groups"
        :placeholder="t('run.placeholder')"
        class="h-80"
        @update:open="isRunOpen = $event"
      />
    </template>
  </UModal>
</template>
