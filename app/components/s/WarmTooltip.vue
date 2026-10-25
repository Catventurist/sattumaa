<script setup lang="ts">
import WarmTooltipGroup from './WarmTooltipGroup.vue'
import type { CSSProperties } from 'vue'
import {
  WARM_TOOLTIP_GROUP,
  type WarmTooltipPayload,
  type WarmTooltipSide,
  type WarmTooltipSize
} from '~/utils/tools'

interface WarmTooltipProps {
  content: string
  shortcut?: string
  side?: WarmTooltipSide
  delay?: number
  warmWindow?: number
  size?: WarmTooltipSize
  gap?: number
  arrow?: boolean
  popDuration?: number
  popScale?: number
  popBlur?: number
  showFuse?: boolean
  longPress?: number
  disabled?: boolean
  className?: string
  grouped?: boolean
}

type Timer = ReturnType<typeof setTimeout> | undefined

const SIZES: Record<WarmTooltipSize, { font: number, px: number, py: number }> = {
  sm: { font: 11.5, px: 8, py: 5 },
  md: { font: 12.5, px: 10, py: 6 },
  lg: { font: 13.5, px: 12, py: 7 }
}
const HOLD_SLOP = 10

const props = withDefaults(defineProps<WarmTooltipProps>(), {
  shortcut: undefined,
  side: 'top',
  delay: undefined,
  warmWindow: undefined,
  size: 'md',
  gap: 8,
  arrow: true,
  popDuration: 160,
  popScale: 0.94,
  popBlur: 4,
  showFuse: false,
  longPress: 500,
  disabled: false,
  className: ''
})

defineSlots<{ default(props: { describedby?: string }): unknown }>()

const group = inject(WARM_TOOLTIP_GROUP, null)
const id = useId()
const triggerRef = ref<HTMLSpanElement | null>(null)
const fuse = ref<'idle' | 'arming'>('idle')
const pressing = ref(false)
let openTimer: Timer
let pressTimer: Timer
let press0: { x: number, y: number, id: number } | null = null
let suppressClick = false

const preset = computed(() => SIZES[props.size] || SIZES.md)
const coldDelay = computed(() => props.delay ?? group?.delay ?? 400)
const active = computed(() => !!group && group.activeId === id)

const payload = (): WarmTooltipPayload => ({
  id,
  trigger: triggerRef.value as HTMLSpanElement,
  content: props.content,
  shortcut: props.shortcut,
  side: props.side,
  gap: props.gap,
  arrow: props.arrow,
  font: preset.value.font,
  px: preset.value.px,
  py: preset.value.py,
  popDuration: props.popDuration,
  popScale: props.popScale,
  popBlur: props.popBlur,
  warmWindow: props.warmWindow ?? group?.warmWindow ?? 300
})

const hide = (instant?: boolean) => {
  clearTimeout(openTimer)
  fuse.value = 'idle'
  group?.hide(id, instant)
}
const arm = () => {
  if (!group) return
  if (group.isWarm()) {
    group.show(payload(), 'warm')
    return
  }
  fuse.value = 'arming'
  openTimer = setTimeout(() => {
    fuse.value = 'idle'
    group.show(payload(), 'cold')
  }, coldDelay.value)
}
const cancelPress = () => {
  clearTimeout(pressTimer)
  if (!press0) return
  press0 = null
  pressing.value = false
  fuse.value = 'idle'
}

watch(() => props.disabled, (d) => {
  if (d) {
    cancelPress()
    hide(true)
  }
})
watch(active, (on, _o, onCleanup) => {
  if (!on) return
  const onOutside = (e: PointerEvent) => {
    if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) hide(false)
  }
  document.addEventListener('pointerdown', onOutside, true)
  onCleanup(() => document.removeEventListener('pointerdown', onOutside, true))
})
onBeforeUnmount(() => {
  clearTimeout(openTimer)
  clearTimeout(pressTimer)
})

const onPointerEnter = (e: PointerEvent) => {
  if (!props.disabled && e.pointerType !== 'touch' && e.buttons === 0) arm()
}
const onPointerLeave = (e: PointerEvent) => {
  if (!props.disabled && e.pointerType !== 'touch') hide(false)
}
const onPointerDown = (e: PointerEvent) => {
  if (props.disabled || !group) return
  if (e.pointerType === 'mouse') {
    hide(false)
    return
  }
  try {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {
    // optional
  }
  press0 = { x: e.clientX, y: e.clientY, id: e.pointerId }
  pressing.value = true
  fuse.value = 'arming'
  pressTimer = setTimeout(() => {
    suppressClick = true
    press0 = null
    pressing.value = false
    fuse.value = 'idle'
    group.show(payload(), 'cold')
  }, props.longPress)
}
const onPointerMove = (e: PointerEvent) => {
  const p = press0
  if (!props.disabled && p && p.id === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > HOLD_SLOP) {
    cancelPress()
  }
}
const onPointerEnd = () => {
  if (!props.disabled) cancelPress()
}
const onContextMenu = (e: MouseEvent) => {
  if (!props.disabled && press0) e.preventDefault()
}
const onClickCapture = (e: MouseEvent) => {
  if (props.disabled || !suppressClick) return
  suppressClick = false
  e.preventDefault()
  e.stopPropagation()
}
const onFocusIn = (e: FocusEvent) => {
  if (props.disabled || !group) return
  if ((e.target as HTMLElement).matches?.(':focus-visible')) group.show(payload(), 'instant')
}
const onFocusOut = () => {
  if (!props.disabled) hide(true)
}
const onKeyDown = (e: KeyboardEvent) => {
  if (!props.disabled && e.key === 'Escape') hide(true)
}

const rootStyle = computed(() => ({
  '--ui-fuse-ms': `${pressing.value ? props.longPress : coldDelay.value}ms`,
  '--ui-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)'
}) as CSSProperties)
</script>

<template>
  <WarmTooltipGroup
    v-if="!group && !grouped"
    :delay="delay"
    :warm-window="warmWindow"
  >
    <WarmTooltip
      v-bind="$props"
      grouped
    >
      <template #default="slotProps">
        <slot v-bind="slotProps" />
      </template>
    </WarmTooltip>
  </WarmTooltipGroup>

  <span
    v-else
    ref="triggerRef"
    class="relative inline-flex align-middle touch-manipulation [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] data-pressing:select-none"
    :class="className"
    :data-pressing="pressing ? '' : undefined"
    :style="rootStyle"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @pointercancel="onPointerEnd"
    @contextmenu="onContextMenu"
    @click.capture="onClickCapture"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown="onKeyDown"
  >
    <slot :describedby="active ? group?.id : undefined" />

    <span
      v-if="showFuse"
      class="pointer-events-none absolute inset-x-1 -top-1 h-0.5 origin-left rounded-[1px] bg-primary opacity-0 transform-[scaleX(0)] [transition:transform_125ms_var(--ui-ease-out),opacity_125ms_var(--ui-ease-out)] data-[fuse=arming]:opacity-100 data-[fuse=arming]:transform-[scaleX(1)] data-[fuse=arming]:[transition:transform_var(--ui-fuse-ms)_linear,opacity_80ms_var(--ui-ease-out)]"
      :data-fuse="fuse"
      aria-hidden="true"
    />
  </span>
</template>
