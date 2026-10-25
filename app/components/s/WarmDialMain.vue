<script setup lang="ts">
import type { CometDialChangeDetail } from '~/components/s/WarmDial.vue'

const level = ref(62)

function handleChange(next: number) {
  level.value = next
}

function handleChangeEnd(next: number, detail: CometDialChangeDetail) {
  level.value = next
  return detail
}
</script>

<template>
  <div class="relative flex items-center justify-center">
    <SWarmDial
      :value="level"
      :min="0"
      :max="100"
      :step="1"
      unit="%"
      color="info"
      :size="250"
      :sweep="320"
      :thickness="5"
      :speed="25"
      :tap-bounce="0.2"
      :flick-bounce="0.1"
      :momentum="1"
      :comet-reach="180"
      :comet-width="12"
      @change="handleChange"
      @change-end="handleChangeEnd"
    />
  </div>
</template>
