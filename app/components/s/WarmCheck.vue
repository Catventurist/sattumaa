<script setup lang="ts">
import { animate, motionValue, useReducedMotion, type AnimationPlaybackControls } from 'motion-v'
import type { CSSProperties } from 'vue'

export type StrikeSide = 'left' | 'center' | 'right' | 'none'
type CheckColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

interface SpringCheckProps {
  label?: string
  disabled?: boolean
  color?: CheckColor
  boxSize?: number
  boxRadius?: number
  fontSize?: number
  bounce?: number
  strikeLag?: number
  doneOpacity?: number
  strike?: StrikeSide
  ariaLabel?: string
  name?: string
  value?: string
}

const VISUAL_DURATION = 0.2
const RULE_END = 0.84
const SWELL = 0.35
const TICK_PATH = 'M20 6 9 17l-5-5'
const ORIGIN: Record<StrikeSide, string> = {
  left: 'left center',
  center: 'center',
  right: 'right center',
  none: 'left center'
}

const FILLS: Record<CheckColor, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  error: 'bg-error',
  neutral: 'bg-inverted'
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const zetaOf = (bounce: number) =>
  bounce <= 0 ? 1 : -Math.log(bounce) / Math.sqrt(Math.PI ** 2 + Math.log(bounce) ** 2)

const readings = (t: number, doneOpacity: number, strikeLag: number) => {
  const held = clamp01(t)
  return {
    fill: `scale(${Math.max(t, 0)})`,
    box: `scale(${1 + SWELL * Math.max(0, t - 1)})`,
    tick: 1 - held,
    word: 1 - (1 - doneOpacity) * held,
    rule: `scaleX(${clamp01((held - strikeLag) / (RULE_END - strikeLag))})`
  }
}

const props = withDefaults(defineProps<SpringCheckProps>(), {
  label: undefined,
  disabled: false,
  color: 'primary',
  boxSize: 28,
  boxRadius: 9,
  fontSize: 18,
  bounce: 0.2,
  strikeLag: 0.12,
  doneOpacity: 0.42,
  strike: 'left',
  ariaLabel: undefined,
  name: undefined,
  value: 'off'
})

const model = defineModel<boolean>({ default: false })
const emit = defineEmits<{ change: [checked: boolean] }>()

const on = computed(() => model.value)
const reduce = useReducedMotion()

const t = motionValue(on.value ? 1 : 0)
let instant = false
let controls: AnimationPlaybackControls | null = null
let off: (() => void) | undefined
const rowRef = ref<HTMLButtonElement | null>(null)
const boxRef = ref<HTMLSpanElement | null>(null)
const fillRef = ref<HTMLSpanElement | null>(null)
const tickRef = ref<SVGPathElement | null>(null)
const wordRef = ref<HTMLSpanElement | null>(null)
const ruleRef = ref<HTMLSpanElement | null>(null)

const initial = readings(on.value ? 1 : 0, props.doneOpacity, props.strikeLag)
const sBox = { transform: initial.box }
const sFill = { transform: initial.fill }
const sTick = { strokeDashoffset: String(initial.tick) }
const sWord = { opacity: String(initial.word) }
const sRule = { transform: initial.rule }

const write = () => {
  const r = readings(t.get(), props.doneOpacity, props.strikeLag)
  if (fillRef.value) fillRef.value.style.transform = r.fill
  if (boxRef.value) boxRef.value.style.transform = r.box
  if (tickRef.value) tickRef.value.style.strokeDashoffset = String(r.tick)
  if (wordRef.value) wordRef.value.style.opacity = String(r.word)
  if (ruleRef.value) ruleRef.value.style.transform = r.rule
}
watchPostEffect(write)
onMounted(() => {
  off = t.on('change', write)
  write()
})
onUnmounted(() => {
  off?.()
  controls?.stop()
})

watch(
  [on, reduce, () => props.bounce],
  () => {
    const target = on.value ? 1 : 0
    controls?.stop()
    if (reduce.value || instant) {
      instant = false
      t.jump(target)
      return
    }
    if (t.get() === target && t.getVelocity() === 0) return
    controls = animate(t, target, {
      type: 'spring',
      visualDuration: VISUAL_DURATION,
      bounce: 1 - zetaOf(props.bounce)
    })
  },
  { flush: 'post' }
)

const press = (e: PointerEvent) => {
  if (e.button !== 0 || props.disabled) return
  if (!reduce.value && rowRef.value) rowRef.value.dataset.pressed = ''
}
const release = () => {
  if (rowRef.value) delete rowRef.value.dataset.pressed
}

const toggle = (e: MouseEvent) => {
  if (props.disabled) return
  instant = e.detail === 0
  const next = !model.value
  model.value = next
  emit('change', next)
}

const cssVars = computed(() => {
  const ring = props.boxSize >= 24 ? 2 : 1.5
  const gap = Math.min(16, Math.max(8, Math.round(props.boxSize * 0.43)))
  const ruleHeight = Math.max(1.5, Math.round(props.fontSize / 6) / 2)
  return {
    '--ui-box': `${props.boxSize}px`,
    '--ui-radius': `${props.boxRadius}px`,
    '--ui-font': `${props.fontSize}px`,
    '--ui-ring': `${ring}px`,
    '--ui-gap': `${gap}px`,
    '--ui-row': `${Math.max(44, props.boxSize + 16)}px`,
    '--ui-rule': `${ruleHeight}px`,
    '--ui-origin': ORIGIN[props.strike] || ORIGIN.left,
    '--ui-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)'
  } as CSSProperties
})
</script>

<template>
  <span class="inline-flex">
    <button
      ref="rowRef"
      type="button"
      role="checkbox"
      :aria-checked="on"
      :aria-label="ariaLabel"
      :disabled="disabled"
      class="group relative inline-flex min-h-(--sr-row,var(--ui-row)) cursor-pointer touch-manipulation items-center gap-(--ui-gap) border-0 bg-transparent p-0 text-left text-(length:--ui-font) leading-[1.2] font-medium tracking-[-0.01em] outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] disabled:cursor-not-allowed disabled:opacity-50"
      :style="cssVars"
      @pointerdown="press"
      @pointerup="release"
      @pointercancel="release"
      @pointerleave="release"
      @click="toggle"
    >
      <span
        class="h-(--ui-box) w-(--ui-box) flex-none rounded-(--ui-radius) transition-transform duration-160 ease-(--ui-ease-out) group-focus-visible:outline-2 group-focus-visible:outline-offset-3 group-focus-visible:outline-primary group-data-pressed:scale-95 motion-reduce:transition-none"
      >
        <span
          ref="boxRef"
          class="relative grid h-full w-full origin-center place-items-center overflow-hidden rounded-[inherit]"
          :style="sBox"
        >
          <span
            class="absolute inset-0 rounded-[inherit] opacity-[0.28] transition-opacity duration-120 inset-shadow-sm inset-shadow-primary [@media(hover:hover)_and_(pointer:fine)]:group-enabled:group-hover:opacity-50"
            aria-hidden="true"
          />
          <span
            ref="fillRef"
            class="absolute inset-0 origin-center rounded-[inherit]"
            :class="FILLS[color]"
            :style="sFill"
          />
          <svg
            class="relative size-[69%] overflow-visible fill-none stroke-current text-inverted [stroke-linecap:round] [stroke-linejoin:round] stroke-[2.6]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              ref="tickRef"
              :d="TICK_PATH"
              pathLength="1"
              stroke-dasharray="1"
              :style="sTick"
            />
          </svg>
        </span>
      </span>

      <span class="relative inline-block">
        <span
          ref="wordRef"
          class="inline-block"
          :style="sWord"
        >
          <slot>{{ label }}</slot>
        </span>
        <span
          v-if="strike !== 'none'"
          ref="ruleRef"
          class="pointer-events-none absolute inset-x-0 top-[46%] h-(--ui-rule) rounded-xs origin-(--ui-origin)"
          aria-hidden="true"
          :style="sRule"
        />
      </span>
    </button>

    <UInput
      v-if="name && model"
      type="hidden"
      :name="name"
      :value="value"
    />
  </span>
</template>
