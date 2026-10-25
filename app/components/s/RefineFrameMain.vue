<script setup lang="ts">
import type { RefineFrameStatus } from '~/components/s/RefineFrame.vue'

const status = ref<RefineFrameStatus>('queued')
let timers: ReturnType<typeof setTimeout>[] = []

function clear() {
  timers.forEach(clearTimeout)
  timers = []
}

function generate() {
  clear()
  status.value = 'queued'
  const steps: [RefineFrameStatus, number][] = [
    ['generating', 800],
    ['refining', 2400],
    ['complete', 4000]
  ]
  timers = steps.map(([next, delay]) => setTimeout(() => {
    status.value = next
  }, delay))
}

onMounted(generate)
onBeforeUnmount(clear)
</script>

<template>
  <SRefineFrame
    :status="status"
    aspect-ratio="4 / 3"
    :width="320"
    :radius="16"
    :stage-duration="400"
    sweep
    show-status
    :hide-after="1200"
    @retry="generate"
  >
    <img
      src="/catbirchdark.webp"
      alt="Cat"
      crossorigin="anonymous"
      draggable="false"
    >
  </SRefineFrame>
</template>
