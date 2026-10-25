<script setup lang="ts">
import { Motion, AnimatePresence } from 'motion-v'
import { START_APPS, startApp } from '~/composables/useWin'
import { useNow } from '@vueuse/core'

const { t, locale } = useI18n()
const { pinned, favorites, taskWindows, focused, toggle, launch } = useWin()

const isStartOpen = ref(false)
const isHovered = ref(false)
const isVisible = computed(() => !autoHide.value || isHovered.value || isStartOpen.value)

const launchers = computed(() =>
  pinned.value.filter(key => key in START_APPS && !(taskWindows.value as string[]).includes(key))
)

const now = useNow()
const { toggleRun } = useRun()

const time = computed(() => new Intl.DateTimeFormat(locale.value, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: !settings.value.clock24h
}).format(now.value))

const { totalUnread } = useMessages()

const { settings } = useSettings()
const autoHide = computed(() => settings.value.taskbarAutoHide)

let clockTimer: ReturnType<typeof setInterval> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined

function show() {
  clearTimeout(hideTimer)
  isHovered.value = true
}

function hide() {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    isHovered.value = false
  }, 300)
}

onMounted(() => {
  now.value = new Date()
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearTimeout(hideTimer)
})

watch(autoHide, () => {
  isHovered.value = false
})
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-40 h-1.5"
    @pointerenter="show"
  />

  <Motion
    as="div"
    class="fixed inset-x-0 bottom-0 z-50 flex h-10 items-center border-t border-inverted/40 bg-info/40 bg-linear-to-b from-default/25 via-transparent via-10% to-inverted/20 backdrop-blur-md"
    :initial="false"
    :animate="{ y: isVisible ? '0%' : '100%' }"
    :transition="{ type: 'spring', stiffness: 400, damping: 36 }"
    @pointerenter="show"
    @pointerleave="hide"
  >
    <MStartMenu
      v-model:open="isStartOpen"
      v-model:pinned="pinned"
      v-model:favorites="favorites"
      color="info"
      type="single"
      highlight
      @select="launch"
    >
      <Motion
        as="div"
        class="h-full"
        :while-tap="{ scale: 0.97 }"
      >
        <UButton
          icon="i-lucide-layout-grid"
          :label="t('taskbar.start')"
          color="neutral"
          class="h-full select-none rounded-none rounded-tr-lg border border-inverted/30 bg-success/90 bg-linear-to-b from-default/30 via-transparent to-inverted/15 px-3 text-sm font-bold text-inverted"
        />
      </Motion>
    </MStartMenu>

    <div class="flex flex-1 items-center gap-1 overflow-x-auto px-2">
      <UTooltip
        v-for="key in launchers"
        :key="key"
        :text="t(startApp(key).label)"
      >
        <UButton
          :icon="startApp(key).icon"
          :aria-label="t(startApp(key).label)"
          @click="launch(key)"
        />
      </UTooltip>

      <AnimatePresence>
        <Motion
          v-for="key in taskWindows"
          :key="key"
          as="div"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 12 }"
          :while-tap="{ scale: 0.95 }"
        >
          <UButton
            :icon="startApp(key).icon"
            :label="t(startApp(key).label)"
            color="neutral"
            size="xs"
            :class="[
              'h-7 max-w-40 rounded-[3px] border border-inverted/30 bg-info/80 bg-linear-to-b text-inverted',
              focused === key
                ? 'from-inverted/25 to-inverted/10 inset-shadow-sm inset-shadow-primary'
                : 'from-default/25 to-inverted/15'
            ]"
            @click="toggle(key)"
          >
            <template #trailing>
              <UBadge
                v-if="key === 'messages' && totalUnread"
                color="error"
                size="sm"
                :label="totalUnread"
              />
            </template>
          </UButton>
        </Motion>
      </AnimatePresence>
    </div>

    <div
      class="flex h-full items-center gap-2 border-l border-inverted/40 bg-info/60 bg-linear-to-b from-inverted/20 to-inverted/40 px-3 text-xs text-inverted"
    >
      <UButton
        :aria-label="t('taskbar.buttons.home')"
        :title="t('taskbar.apps.home')"
        icon="i-lucide-home"
        color="neutral"
        variant="link"
        size="sm"
        class="text-inverted"
        to="/"
      />
      <UButton
        :aria-label="t('taskbar.buttons.search')"
        :title="t('taskbar.buttons.search')"
        icon="i-lucide-search"
        color="neutral"
        variant="link"
        size="sm"
        class="text-inverted"
        @click="toggleRun"
      />
      <MMusicPlayer :title="t('taskbar.buttons.volume')" />
      <ColorModeButton
        size="sm"
        variant="link"
        class="text-inverted"
      />
      <MLanguageButton :title="t('taskbar.buttons.language')" />
      <ClientOnly>
        <UButton
          :aria-label="t('taskbar.apps.clock')"
          :title="t('taskbar.buttons.time')"
          color="neutral"
          variant="link"
          size="sm"
          class="font-mono tabular-nums text-inverted"
          @click="toggle('clock')"
        >
          {{ time }}
        </UButton>
      </ClientOnly>
    </div>
  </Motion>
</template>
