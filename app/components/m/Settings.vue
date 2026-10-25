<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const { t } = useI18n()
const { settings, reset } = useSettings()
const appConfig = useAppConfig()

const tab = ref('general')

const tabs = computed<TabsItem[]>(() => [
  { label: t('settings.general'), icon: 'i-lucide-sliders-horizontal', value: 'general' },
  { label: t('settings.appearance'), icon: 'i-lucide-palette', value: 'appearance' },
  { label: t('settings.account'), icon: 'i-lucide-user', value: 'account' }
])

const modes = computed(() => [
  { label: t('settings.modePopover'), value: 'popover' },
  { label: t('settings.modeTabbar'), value: 'tabbar' }
])

const wallpapers = computed(() => [
  { label: t('settings.none'), value: 'none' },
  ...Object.values(FS_NODES)
    .filter(n => n.kind === 'image' && n.src)
    .map(n => ({ label: t(n.nameKey!), value: n.id }))
])

const wallpaper = computed({
  get: () => settings.value.wallpaper ?? 'none',
  set: (v: string) => {
    settings.value.wallpaper = v === 'none' ? null : v
  }
})

const swatches: Record<Accent, string> = {
  blue: 'var(--swatch-blue)',
  sky: 'var(--swatch-sky)',
  indigo: 'var(--swatch-indigo)',
  violet: 'var(--swatch-violet)',
  green: 'var(--swatch-green)',
  emerald: 'var(--swatch-emerald)',
  amber: 'var(--swatch-amber)',
  orange: 'var(--swatch-orange)',
  rose: 'var(--swatch-rose)'
}

watch(() => settings.value.accent, (value) => {
  appConfig.ui.colors.info = value
}, { immediate: true })
</script>

<template>
  <MWindow
    :open="open"
    :title="t('settings.title')"
    icon="i-lucide-settings"
    :constraints="constraints"
    size-class="h-[26rem] w-full max-w-2xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0">
      <UTabs
        v-model="tab"
        :items="tabs"
        :content="false"
        orientation="vertical"
        class="w-44 shrink-0 border-r border-default p-2"
      />

      <div class="min-w-0 flex-1 space-y-4 overflow-auto p-4">
        <template v-if="tab === 'general'">
          <UFormField
            :label="t('settings.autoHide')"
            :description="t('settings.autoHideHint')"
          >
            <USwitch
              v-model="settings.taskbarAutoHide"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
            />
          </UFormField>
          <UFormField :label="t('settings.clock24h')">
            <USwitch
              v-model="settings.clock24h"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
            />
          </UFormField>
          <UFormField :label="t('settings.startMenuMode')">
            <USelect
              v-model="settings.startMenuMode"
              :items="modes"
              class="w-48"
            />
          </UFormField>
          <UFormField :label="t('settings.language')">
            <LocaleSel />
          </UFormField>
          <UFormField :label="t('settings.musicRepeat')">
            <USwitch
              v-model="settings.musicRepeat"
              unchecked-icon="i-lucide-x"
              checked-icon="i-lucide-check"
            />
          </UFormField>
          <UFormField :label="t('settings.musicVolume')">
            <USlider
              v-model="settings.musicVolume"
              :aria-label="t('settings.musicVolume')"
              class="w-48"
            />
          </UFormField>
        </template>

        <template v-else-if="tab === 'appearance'">
          <UFormField :label="t('settings.colorMode')">
            <ColorModeButton />
          </UFormField>
          <UFormField :label="t('settings.accent')">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in ACCENTS"
                :key="c"
                type="button"
                :aria-label="c"
                :aria-pressed="settings.accent === c"
                class="size-6 rounded-full ring-offset-2 ring-offset-default"
                :style="{ backgroundColor: swatches[c] }"
                :class="[
                  'size-8 rounded-full transition',
                  settings.accent === c && 'ring-2 ring-inverted'
                ]"
                @click="settings.accent = c"
              />
            </div>
          </UFormField>
          <UFormField :label="t('settings.wallpaper')">
            <USelect
              v-model="wallpaper"
              :items="wallpapers"
              class="w-48"
            />
          </UFormField>
        </template>

        <template v-else>
          <UButton icon="i-lucide-user" />
        </template>

        <USeparator />
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="outline"
          :label="t('settings.reset')"
          @click="reset"
        />
      </div>
    </div>
  </MWindow>
</template>
