<script setup lang="ts">
import { Motion, AnimatePresence, useDragControls, useMotionValue } from 'motion-v'

const props = withDefaults(defineProps<{
  title: string
  icon?: string
  constraints?: HTMLElement | null
  sizeClass?: string
}>(), {
  icon: 'i-lucide-app-window',
  constraints: null,
  sizeClass: 'h-96 w-full max-w-3xl'
})

const emit = defineEmits<{ minimize: [], close: [] }>()
const open = defineModel<boolean>('open', { default: true })

const { t } = useI18n()
const maximized = ref(false)
const dragControls = useDragControls()

const x = useMotionValue(0)
const y = useMotionValue(0)
let saved = { x: 0, y: 0 }

function toggleMaximize() {
  if (!maximized.value) {
    saved = { x: x.get(), y: y.get() }
    x.set(0)
    y.set(0)
    maximized.value = true
  } else {
    maximized.value = false
    x.set(saved.x)
    y.set(saved.y)
  }
}

let lastDown = 0

function startDrag(event: PointerEvent) {
  if (maximized.value) return

  const isDoublePress = event.timeStamp - lastDown < 350
  lastDown = event.timeStamp

  if (!isDoublePress) {
    dragControls.start(event)
  }
}

function minimize() {
  emit('minimize')
  open.value = false
}

function close() {
  emit('close')
  open.value = false
}
</script>

<template>
  <AnimatePresence>
    <Motion
      v-if="open"
      as="section"
      :style="{ x, y }"
      :drag="!maximized"
      :drag-controls="dragControls"
      :drag-listener="false"
      :drag-momentum="false"
      :drag-elastic="0"
      :drag-constraints="props.constraints ?? undefined"
      :initial="{ opacity: 0, scale: 0.94 }"
      :animate="{ opacity: 1, scale: 1 }"
      :exit="{ opacity: 0, scale: 0.94 }"
      :transition="{ type: 'spring', stiffness: 380, damping: 32 }"
      :class="[
        'flex flex-col overflow-hidden rounded-t-lg border border-inverted/40 bg-default/80',
        maximized ? 'fixed inset-x-2 top-2 bottom-12 z-40' : `relative ${props.sizeClass}`
      ]"
    >
      <header
        :class="[
          'flex touch-none select-none items-center gap-2 bg-info/85 bg-linear-to-b from-default/25 to-inverted/15 px-2 py-1 text-inverted',
          maximized ? '' : 'cursor-grab active:cursor-grabbing'
        ]"
        @pointerdown="startDrag"
        @dblclick="toggleMaximize"
      >
        <UIcon
          :name="icon"
          class="size-4"
        />
        <span class="flex-1 truncate text-xs font-bold">{{ title }}</span>

        <div
          class="flex items-center gap-2"
          @pointerdown.stop
          @dblclick.stop
        >
          <UButton
            icon="i-lucide-minus"
            size="xs"
            square
            color="neutral"
            variant="ghost"
            class="text-inverted"
            :aria-label="t('window.minimize')"
            @click="minimize"
          />
          <UButton
            :icon="maximized ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
            size="xs"
            square
            color="neutral"
            variant="ghost"
            class="text-inverted"
            :aria-label="t(maximized ? 'window.restore' : 'window.maximize')"
            @click="toggleMaximize"
          />
          <UButton
            icon="i-lucide-x"
            size="xs"
            square
            color="error"
            variant="solid"
            :aria-label="t('window.close')"
            @click="close"
          />
        </div>
      </header>

      <div class="flex min-h-0 flex-1 flex-col max-h-[calc(100dvh-8rem)]">
        <slot />
      </div>
    </Motion>
  </AnimatePresence>
</template>
