<script setup lang="ts">
import { frame, motionValue, useReducedMotion, useSpring, useVelocity } from 'motion-v'
import type { CSSProperties } from 'vue'

interface WakeSliderProps {
  min?: number
  max?: number
  step?: number
  bars?: number
  height?: number
  restHeight?: number
  gap?: number
  fillColor?: string
  trackColor?: string
  crestColor?: string
  sensitivity?: number
  reach?: number
  skew?: number
  glide?: number
  smoothing?: number
  showValue?: boolean
  formatValue?: (value: number) => string
  disabled?: boolean
  ariaLabel?: string
}

const SETTLE = 9.23
const FULL_SPEED = 320
const MIN_REACH = 1.5
const FLAT = 0.002

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smoothstep = (s: number) => s * s * (3 - 2 * s)
const toPct = (v: number, min: number, max: number) => (max > min ? ((v - min) / (max - min)) * 100 : 0)
const snap = (v: number, min: number, max: number, step: number) => {
  if (!(max > min)) return min
  if (!(step > 0)) return clamp(v, min, max)
  const lastWhole = min + Math.floor(+((max - min) / step).toFixed(6)) * step
  const grid = clamp(Math.round((v - min) / step) * step + min, min, lastWhole)
  return +(lastWhole < max && Math.abs(v - max) <= Math.abs(v - grid) ? max : grid).toFixed(6)
}

const props = withDefaults(defineProps<WakeSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  bars: 32,
  height: 56,
  restHeight: 12,
  gap: 4,
  fillColor: '',
  trackColor: '',
  crestColor: '',
  sensitivity: 1,
  reach: 6,
  skew: 0.6,
  glide: 0.3,
  smoothing: 100,
  showValue: false,
  formatValue: undefined,
  disabled: false
})

const { t } = useI18n()
const model = defineModel<number>({ default: 50 })
const emit = defineEmits<{ change: [value: number] }>()

const current = computed(() => clamp(model.value, props.min, props.max))
const pct = computed(() => toPct(current.value, props.min, props.max))
const lit = computed(() => Math.round((pct.value / 100) * (props.bars - 1)))
const reduce = useReducedMotion()
const format = (v: number) => (props.formatValue ? props.formatValue(v) : String(v))
const rest = computed(() => Math.min(props.restHeight, props.height - 1) / props.height)

const ready = ref(false)

const rootRef = ref<HTMLDivElement | null>(null)
const trackRef = ref<HTMLDivElement | null>(null)
const handleRef = ref<HTMLButtonElement | null>(null)
const barEls: (HTMLSpanElement | null)[] = []
const crestEls: (HTMLSpanElement | null)[] = []
let pointerId: number | null = null
let trackRect: DOMRect | null = null
let trackRtl = false
let lastAmp = 0
let latest = current.value

const target = motionValue(pct.value)
const w0 = SETTLE / props.glide
const head = useSpring(target, { stiffness: w0 * w0, damping: 2 * w0, mass: 1 })
const rawSpeed = useVelocity(head)
const wv = 2000 / props.smoothing
const speed = useSpring(rawSpeed, { stiffness: wv * wv, damping: 2.5 * wv, mass: 1 })

const setBar = (i: number, el: unknown) => {
  barEls[i] = el as HTMLSpanElement | null
}
const setCrest = (i: number, el: unknown) => {
  crestEls[i] = el as HTMLSpanElement | null
}

const paint = (force = false) => {
  const bars = props.bars
  const h = ((reduce.value ? target.get() : head.get()) / 100) * (bars - 1)
  const v = reduce.value ? 0 : speed.get()
  const amp = smoothstep(clamp((Math.abs(v) * props.sensitivity) / FULL_SPEED, 0, 1))
  const dir = Math.sign(v) || 1
  const r = MIN_REACH + (props.reach - MIN_REACH) * amp
  const behind = r * (1 + props.skew)
  const ahead = r * (1 - 0.5 * props.skew)
  const litBar = Math.round(h)
  const flat = !force && amp < FLAT && lastAmp < FLAT
  const rs = rest.value
  for (let i = 0; i < bars; i++) {
    const el = barEls[i]
    if (!el) continue
    const on = i <= litBar ? 'true' : 'false'
    if (el.dataset.on !== on) el.dataset.on = on
    if (flat) continue
    const d = i - h
    const R = d * dir < 0 ? behind : ahead
    const lift = Math.abs(d) < R ? amp * Math.cos((Math.PI * d) / (2 * R)) ** 2 : 0
    el.style.transform = `scaleY(${rs + lift * (1 - rs)})`
    const crest = crestEls[i]
    if (crest) crest.style.opacity = String(lift)
  }
  lastAmp = amp
}
const run = () => paint()
const schedule = () => frame.render(run, false, true)
const offs: (() => void)[] = []

onMounted(() => {
  offs.push(head.on('change', schedule), speed.on('change', schedule))
  ready.value = true
  paint(true)
})
onUpdated(() => paint(true))
watch(pct, p => target.set(p))
watch([() => props.bars, rest, reduce], () => {
  barEls.length = props.bars
  crestEls.length = props.bars
  paint(true)
}, { flush: 'post' })
onUnmounted(() => {
  offs.forEach(off => off())
  head.stop()
  speed.stop()
  target.stop()
})

const commit = (next: number) => {
  const clean = snap(next, props.min, props.max, props.step)
  if (clean === latest) return
  latest = clean
  model.value = clean
  emit('change', clean)
}
watch(current, v => (latest = v))

const commitFromX = (x: number) => {
  const rect = trackRect
  if (!rect?.width) return
  let ratio = clamp((x - rect.left) / rect.width, 0, 1)
  if (trackRtl) ratio = 1 - ratio
  commit(props.min + ratio * (props.max - props.min))
}
const onPointerDown = (e: PointerEvent) => {
  if (props.disabled || pointerId !== null || !trackRef.value) return
  pointerId = e.pointerId
  trackRect = trackRef.value.getBoundingClientRect()
  trackRtl = getComputedStyle(trackRef.value).direction === 'rtl'
  try {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {
    // unavailable
  }
  rootRef.value?.removeAttribute('data-instant')
  handleRef.value?.focus({ preventScroll: true })
  commitFromX(e.clientX)
}
const onPointerMove = (e: PointerEvent) => {
  if (e.pointerId === pointerId) commitFromX(e.clientX)
}
const endDrag = (e: PointerEvent) => {
  if (e.pointerId !== pointerId) return
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    // released
  }
  pointerId = null
  trackRect = null
}
const onKeyDown = (e: KeyboardEvent) => {
  if (props.disabled) return
  const { step, min, max } = props
  const v = current.value
  const rtl = trackRef.value ? getComputedStyle(trackRef.value).direction === 'rtl' : false
  const jumps: Record<string, number> = {
    ArrowRight: rtl ? v - step : v + step,
    ArrowLeft: rtl ? v + step : v - step,
    ArrowUp: v + step,
    ArrowDown: v - step,
    PageUp: v + step * 10,
    PageDown: v - step * 10,
    Home: min,
    End: max
  }
  if (!(e.key in jumps)) return
  e.preventDefault()
  const clean = snap(jumps[e.key]!, min, max, step)
  const p = toPct(clean, min, max)
  rootRef.value?.setAttribute('data-instant', 'true')
  head.jump(p)
  speed.jump(0)
  target.jump(p)
  commit(clean)
}

const rootStyle = computed(() => {
  const fill = props.fillColor || 'var(--ui-primary)'
  return {
    '--ui-fill': fill,
    '--ui-track': props.trackColor || 'var(--ui-bg-accented)',
    '--ui-crest': props.crestColor || fill,
    '--ui-height': `${props.height}px`,
    '--ui-gap': `${props.gap}px`,
    '--ui-rest': rest.value
  } as CSSProperties
})
</script>

<template>
  <div
    ref="rootRef"
    class="group inline-flex w-full items-center gap-3 text-inherit data-disabled:pointer-events-none data-disabled:opacity-50"
    :data-disabled="disabled || undefined"
    :style="rootStyle"
  >
    <div
      ref="trackRef"
      class="relative flex h-(--ui-height) min-h-11 flex-1 items-center gap-(--ui-gap) touch-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] [@media(hover:hover)_and_(pointer:fine)]:cursor-grab [@media(hover:hover)_and_(pointer:fine)]:active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @lostpointercapture="endDrag"
    >
      <span
        v-for="i in bars"
        :key="i"
        :ref="el => setBar(i - 1, el)"
        class="relative h-(--ui-height) min-w-0 flex-1 origin-center rounded-full bg-(--ui-track) transform-[scaleY(var(--ui-rest))] transition-[background-color] duration-120 data-[on=true]:bg-(--ui-fill) group-data-[instant=true]:duration-0 motion-reduce:transform-[scaleY(var(--ui-rest))]!"
        :data-on="ready ? undefined : (i - 1 <= lit ? 'true' : 'false')"
      >
        <span
          v-if="crestColor"
          :ref="el => setCrest(i - 1, el)"
          class="absolute inset-0 rounded-[inherit] bg-(--ui-crest) opacity-0"
        />
      </span>

      <button
        ref="handleRef"
        type="button"
        role="slider"
        class="absolute inset-0 m-0 cursor-[inherit] touch-none rounded-xl border-0 bg-transparent p-0 outline-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :tabindex="disabled ? -1 : 0"
        :aria-label="ariaLabel ?? t('tools.slider')"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="current"
        :aria-valuetext="format(current)"
        :aria-disabled="disabled || undefined"
        @keydown="onKeyDown"
      />
    </div>

    <span
      v-if="showValue"
      class="min-w-[3ch] text-right text-[13px] tabular-nums opacity-60"
      aria-hidden="true"
    >
      {{ format(current) }}
    </span>
  </div>
</template>
