<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { formatSeconds } from '~/composables/useAlarms'

const { t } = useI18n()
const toast = useToast()

const presets = [1, 5, 10, 15]

const minutes = ref(5)
const remaining = ref(0)
const total = ref(0)
const running = ref(false)
const touched = ref(false)

let endsAt = 0

const shown = computed(() => touched.value ? remaining.value : minutes.value * 60)
const percent = computed(() => touched.value && total.value ? (remaining.value / total.value) * 100 : 100)

const { pause, resume } = useIntervalFn(tick, 200, { immediate: false })

function tick() {
  remaining.value = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
  if (remaining.value === 0) finish()
}

function toggle() {
  if (running.value) {
    pause()
    running.value = false
    return
  }
  if (!touched.value) {
    total.value = minutes.value * 60
    remaining.value = total.value
    touched.value = true
  }
  endsAt = Date.now() + remaining.value * 1000
  resume()
  running.value = true
}

function clear() {
  pause()
  running.value = false
  touched.value = false
}

function finish() {
  clear()
  toast.add({
    title: t('clock.timerDone'),
    icon: 'i-lucide-hourglass',
    color: 'info',
    duration: 0
  })
}

function adjust(delta: number) {
  minutes.value = Math.min(99, Math.max(1, minutes.value + delta))
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4">
    <p class="font-mono text-5xl text-info tabular-nums">
      {{ formatSeconds(shown) }}
    </p>
    <UProgress
      :model-value="percent"
      :max="100"
      color="info"
      size="xs"
      class="w-full"
    />
    <div class="flex items-center gap-2">
      <UButton
        icon="i-lucide-minus"
        :aria-label="t('clock.decrease')"
        :disabled="touched"
        color="neutral"
        variant="ghost"
        square
        @click="adjust(-1)"
      />
      <span class="w-16 text-center font-mono tabular-nums">{{ minutes }} {{ t('clock.minutes') }}</span>
      <UButton
        icon="i-lucide-plus"
        :aria-label="t('clock.increase')"
        :disabled="touched"
        color="neutral"
        variant="ghost"
        square
        @click="adjust(1)"
      />
    </div>
    <div class="flex gap-2">
      <UButton
        v-for="preset in presets"
        :key="preset"
        :label="`${preset}`"
        :disabled="touched"
        :color="minutes === preset ? 'info' : 'neutral'"
        :variant="minutes === preset ? 'soft' : 'outline'"
        size="xs"
        @click="minutes = preset"
      />
    </div>
    <div class="flex gap-2">
      <UButton
        :icon="running ? 'i-lucide-pause' : 'i-lucide-play'"
        :label="running ? t('clock.pause') : t('clock.start')"
        color="info"
        @click="toggle"
      />
      <UButton
        icon="i-lucide-rotate-ccw"
        :label="t('clock.reset')"
        :disabled="!touched"
        color="neutral"
        variant="ghost"
        @click="clear"
      />
    </div>
  </div>
</template>
