<script setup lang="ts">
import type { Component } from 'vue'
import {
  LazyMBoard, LazyMBrowser, LazyMClockApp, LazyMCommunication, LazyMExplorer,
  LazyMGallery, LazyMJitsiWindow, LazyMKiosk, LazyMMediaPlayer, LazyMMessages,
  LazyMNotes, LazyMPaint, LazyMSettings, LazyMSheet
} from '#components'

const { states, isWinKey, zIndex, focus, minimize, close } = useWin()
const bounds = useTemplateRef<HTMLElement>('bounds')
const { settings } = useSettings()
const route = useRoute()

interface WindowConfig {
  id: WinKey
  component: Component
  position?: string
  width?: string
}

const DEFAULT_POSITION = 'bottom-24 left-24'
const DEFAULT_WIDTH = 'w-[min(48rem,calc(100vw-2rem))]'
const WIDE = 'w-[min(56rem,calc(100vw-2rem))]'

const bounded: WindowConfig[] = [
  { id: 'browser', component: LazyMBrowser, position: 'bottom-12 left-4' },
  { id: 'notes', component: LazyMNotes, position: 'bottom-16 left-12', width: WIDE },
  { id: 'messages', component: LazyMMessages, position: 'bottom-20 left-20' },
  { id: 'explorer', component: LazyMExplorer }
]

const floating: WindowConfig[] = [
  { id: 'media', component: LazyMMediaPlayer },
  { id: 'music', component: LazyMMediaPlayer },
  { id: 'pictures', component: LazyMGallery },
  { id: 'settings', component: LazyMSettings },
  { id: 'board', component: LazyMBoard },
  { id: 'clock', component: LazyMClockApp },
  { id: 'paint', component: LazyMPaint },
  { id: 'sheet', component: LazyMSheet },
  { id: 'kiosk', component: LazyMKiosk },
  { id: 'jitsi', component: LazyMJitsiWindow }
]

const wallpaperStyle = computed(() => {
  const src = settings.value.wallpaper ? FS_NODES[settings.value.wallpaper]?.src : null
  return src
    ? { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}
})

function openWindow(id: WinKey) {
  states.value[id] = 'open'
  focus(id)
}

function launchFromQuery() {
  const requested = String(route.query.open ?? '')
  if (!isWinKey(requested)) return

  openWindow(requested)
  navigateTo({ path: route.path, query: {} }, { replace: true })
}

onMounted(launchFromQuery)
watch(() => route.query.open, launchFromQuery)
</script>

<template>
  <div :style="wallpaperStyle">
    <UMain>
      <slot />
    </UMain>
    <MRunDialog />

    <div
      ref="bounds"
      class="pointer-events-none fixed inset-0 z-30"
    >
      <template
        v-for="win in bounded"
        :key="win.id"
      >
        <div
          v-if="states[win.id] !== 'closed'"
          class="pointer-events-auto absolute"
          :class="[win.position ?? DEFAULT_POSITION, win.width ?? DEFAULT_WIDTH]"
          :style="{ zIndex: zIndex(win.id) }"
          @pointerdown.capture="focus(win.id)"
        >
          <component
            :is="win.component"
            :open="states[win.id] === 'open'"
            :constraints="bounds"
            @minimize="minimize(win.id)"
            @close="close(win.id)"
          />
        </div>
      </template>
    </div>

    <template
      v-for="win in floating"
      :key="win.id"
    >
      <div
        v-if="states[win.id] !== 'closed'"
        class="pointer-events-auto absolute"
        :class="[win.position ?? DEFAULT_POSITION, win.width ?? DEFAULT_WIDTH]"
        :style="{ zIndex: zIndex(win.id) }"
        @pointerdown.capture="focus(win.id)"
      >
        <component
          :is="win.component"
          :open="states[win.id] === 'open'"
          :constraints="bounds"
          @minimize="minimize(win.id)"
          @close="close(win.id)"
        />
      </div>
    </template>

    <div
      v-if="states.communication !== 'closed'"
      class="pointer-events-auto absolute"
      :class="[DEFAULT_POSITION, DEFAULT_WIDTH]"
      :style="{ zIndex: zIndex('communication') }"
      @pointerdown.capture="focus('communication')"
    >
      <LazyMCommunication
        :open="states.communication === 'open'"
        :constraints="bounds"
        @minimize="states.communication = 'minimized'"
        @close="states.communication = 'closed'"
        @launch="openWindow"
      />
    </div>

    <MTaskBar />
  </div>
</template>
