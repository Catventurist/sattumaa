<script setup lang="ts">
import { useRafFn } from '@vueuse/core'
import { formatMs } from '~/composables/useAlarms'

const { t } = useI18n()

const elapsed = ref(0)
const running = ref(false)
const laps = ref<number[]>([])

let base = 0
let startedAt = 0

const { pause, resume } = useRafFn(() => {
  elapsed.value = base + performance.now() - startedAt
}, { immediate: false })

function toggle() {
  if (running.value) {
    pause()
    running.value = false
    return
  }
  base = elapsed.value
  startedAt = performance.now()
  resume()
  running.value = true
}

function lap() {
  laps.value = [elapsed.value, ...laps.value]
}

function clear() {
  pause()
  running.value = false
  elapsed.value = 0
  base = 0
  laps.value = []
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4">
    <p class="font-mono text-5xl text-info tabular-nums">
      {{ formatMs(elapsed) }}
    </p>
    <div class="flex gap-2">
      <UButton
        :icon="running ? 'i-lucide-pause' : 'i-lucide-play'"
        :label="running ? t('clock.pause') : t('clock.start')"
        color="info"
        @click="toggle"
      />
      <UButton
        icon="i-lucide-flag"
        :label="t('clock.lap')"
        :disabled="!running"
        color="neutral"
        variant="outline"
        @click="lap"
      />
      <UButton
        icon="i-lucide-rotate-ccw"
        :label="t('clock.reset')"
        :disabled="!elapsed"
        color="neutral"
        variant="ghost"
        @click="clear"
      />
    </div>
    <ul class="max-h-40 w-full space-y-1 overflow-auto">
      <li
        v-for="(entry, i) in laps"
        :key="laps.length - i"
        class="flex justify-between rounded-sm bg-elevated/50 px-3 py-1 font-mono text-sm tabular-nums"
      >
        <span class="text-muted">{{ laps.length - i }}</span>
        <span>{{ formatMs(entry) }}</span>
      </li>
    </ul>
  </div>
</template>
