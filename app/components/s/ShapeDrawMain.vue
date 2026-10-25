<script setup lang="ts">
const dots = [
  { id: 'ear-left', x: 5, y: 3 },
  { id: 'top', x: 12, y: 5 },
  { id: 'ear-right', x: 19, y: 3 },
  { id: 'cheek-r', x: 21, y: 13 },
  { id: 'bottom', x: 12, y: 21 },
  { id: 'cheek-l', x: 3, y: 13 }
]

const connectionCount = ref(0)
const isComplete = computed(() => connectionCount.value >= dots.length)

function onConnect() {
  connectionCount.value++
}
function onDisconnect() {
  connectionCount.value--
}
</script>

<template>
  <div>
    <ClientOnly>
      <SShapeDraw
        freehand
        :dots="dots"
        :dot-radius="0.8"
        :stroke-width="0.3"
        viewBox="0 0 24 24"
        class="size-100"
        @connect="onConnect"
        @disconnect="onDisconnect"
      >
        <template #background>
          <g
            fill="none"
            :stroke="isComplete ? 'var(--ui-primary)' : 'currentColor'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="transition-colors duration-500"
          >
            <path d="M12 5c.67 0 1.35.09 2 .26c1.78-2 5.03-2.84 6.42-2.26c1.4.58-.42 7-.42 7c.57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44c0 0-1.89-6.42-.5-7s4.72.23 6.5 2.23A9 9 0 0 1 12 5m-4 9v.5m8-.5v.5" />
            <path d="M11.25 16.25h1.5L12 17z" />
          </g>
        </template>
      </SShapeDraw>
    </ClientOnly>
  </div>
</template>
