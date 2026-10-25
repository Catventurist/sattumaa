<script setup lang="ts">
const sources = ['/catbirch.webp', '/catbirchdark.webp']

const images = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: sources[i % sources.length]!
}))
</script>

<template>
  <div class="relative h-150 overflow-hidden">
    <SImageSpiral
      :items="images"
      animation-mode="all"
      :speed="0.55"
      :radius="170"
      :card-width="100"
      :card-height="100"
      :vertical-spacing="60"
      :perspective="1000"
      :card-radius="10"
      :center-scale="1.2"
      :edge-blur="6"
      :cards-per-turn="7"
      pause-on-hover
    />
  </div>
</template>
