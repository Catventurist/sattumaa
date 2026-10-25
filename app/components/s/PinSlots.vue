<script setup lang="ts">
import { animate, motionValue, useMotionValue, useReducedMotion, useTransform } from 'motion-v'

export type PinSlotsStatus = 'idle' | 'error' | 'success'

interface PinSlotsProps {
  length?: number
  value?: string
  defaultValue?: string
  status?: PinSlotsStatus
  mask?: boolean
  caret?: boolean
  disabled?: boolean
  autoFocus?: boolean
  slotSize?: number
  gap?: number
  radius?: number
  bounce?: number
  settle?: number
  rise?: number
  cascade?: number
  ariaLabel?: string
  id?: string
  name?: string
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const WASH_IN = 0.3
const WASH_OUT = 0.2
const SINK_DELAY = 0.06
const SINK_STEP = 0.03
const CHECK_DELAY = 0.28
const CHECK_RISE = 8

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function digitsOf(raw: string | undefined) {
  return String(raw ?? '').replace(/\D/g, '')
}

function toSlots(raw: string | undefined, n: number) {
  const d = digitsOf(raw).slice(0, n)
  return Array.from({ length: n }, (_, i) => d[i] ?? '')
}

function firstEmptyOf(list: string[]) {
  const i = list.indexOf('')
  return i === -1 ? list.length - 1 : i
}

function isFull(list: string[]) {
  return list.every(Boolean)
}

const props = withDefaults(defineProps<PinSlotsProps>(), {
  length: 6,
  value: undefined,
  defaultValue: '',
  status: 'idle',
  mask: false,
  caret: true,
  disabled: false,
  autoFocus: false,
  slotSize: 44,
  gap: 8,
  radius: 12,
  bounce: 0.2,
  settle: 0.3,
  rise: 8,
  cascade: 20,
  ariaLabel: undefined,
  id: undefined,
  name: undefined
})

const emit = defineEmits<{
  change: [code: string]
  complete: [code: string]
}>()

const { t } = useI18n()
const uid = useId()
const reduce = useReducedMotion()
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const rowRef = useTemplateRef<HTMLDivElement>('rowRef')

let cur = toSlots(props.value ?? props.defaultValue, props.length)
const slots = ref<string[]>(cur)
const active = ref(firstEmptyOf(cur))
const focused = ref(false)
const veiled = ref(props.status === 'success')
const activeMv = useMotionValue(active.value)
const openMv = useMotionValue(props.status === 'success' ? 1 : 0)
const checkMv = useMotionValue(props.status === 'success' ? 1 : 0)

const inputId = computed(() => props.id ?? `${uid}-input`)

const glide = new Set<number>()
let target: number[] = []
let draining = false
let drainTimer: ReturnType<typeof setTimeout> | undefined
let prevStatus = props.status
let emitted = digitsOf(props.value ?? props.defaultValue).slice(0, props.length)

function setSlots(next: string[]) {
  cur = next
  slots.value = next
}

const springs = computed(() => ({
  mvs: Array.from({ length: props.length }, (_, i) => motionValue(cur[i] ? 1 : 0)),
  drops: Array.from({ length: props.length }, () => motionValue(prevStatus === 'success' ? 1 : 0))
}))
const pitch = computed(() => props.slotSize + props.gap)
const height = computed(() => Math.round(props.slotSize * 1.18))
const groupLabel = computed(() => props.ariaLabel ?? t('pinSlots.label'))

function washRadius() {
  return Math.min(props.radius, props.slotSize / 2)
}

function drive(i: number, to: number, delayMs = 0) {
  const mv = springs.value.mvs[i]
  if (!mv) return
  target[i] = to
  if (reduce.value) {
    mv.jump(to)
    return
  }
  animate(mv, to, { type: 'spring', duration: props.settle, bounce: props.bounce, delay: delayMs / 1000 })
}

function land(i: number, delayMs = 0) {
  const mv = springs.value.mvs[i]
  if (mv && mv.get() > 0) mv.jump(0)
  drive(i, 1, delayMs)
}

function moveActive(next: number, crossed: number[]) {
  crossed.forEach(j => glide.add(j))
  activeMv.jump(next)
  active.value = next
}

function jumpActive(next: number) {
  glide.clear()
  activeMv.jump(next)
  active.value = next
}

const caretX = useTransform(() => {
  const { mvs } = springs.value
  const a = activeMv.get()
  let x = a * pitch.value
  for (let j = 0; j < mvs.length; j++) {
    const level = clamp01(mvs[j]!.get())
    if (!glide.has(j)) continue
    const to = target[j]
    if (to === undefined || level === clamp01(to)) {
      glide.delete(j)
      continue
    }
    x += j < a ? -(1 - level) * pitch.value : level * pitch.value
  }
  return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch.value)
})
const caretTransform = useTransform(caretX, (x: number) => `translateX(${x}px)`)
const washClip = useTransform(openMv, (o: number) => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius()}px)`)
const checkTransform = useTransform(
  checkMv,
  (c: number) => `translateY(${(1 - c) * CHECK_RISE}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`
)
const checkOpacity = useTransform(checkMv, clamp01)

function commit(next: string[]) {
  const prev = cur
  setSlots(next)
  const code = next.join('')
  emitted = code
  emit('change', code)
  if (!isFull(prev) && isFull(next)) emit('complete', code)
}

function insert(raw: string, from = active.value) {
  const digits = digitsOf(raw)
  if (!digits) return
  const next = [...cur]
  const crossed: number[] = []
  const step = reduce.value ? 0 : props.cascade
  let i = from
  for (const ch of digits) {
    if (i >= props.length) break
    next[i] = ch
    land(i, (i - from) * step)
    crossed.push(i)
    i += 1
  }
  if (!crossed.length) return
  commit(next)
  moveActive(Math.min(i, props.length - 1), crossed)
}

function clearSlot(i: number, stepBack = false) {
  if (!cur[i]) {
    if (stepBack) jumpActive(i)
    return
  }
  const next = [...cur]
  next[i] = ''
  drive(i, 0)
  commit(next)
  if (stepBack) moveActive(i, [i])
}

function busy() {
  return props.disabled || draining || props.status === 'success'
}

function onKeyDown(e: KeyboardEvent) {
  if (busy() || e.metaKey || e.ctrlKey || e.altKey) return
  const k = e.key
  if (/^[0-9]$/.test(k)) {
    e.preventDefault()
    insert(k)
  } else if (k === 'Backspace') {
    e.preventDefault()
    if (slots.value[active.value]) clearSlot(active.value)
    else if (active.value > 0) clearSlot(active.value - 1, true)
  } else if (k === 'Delete') {
    e.preventDefault()
    clearSlot(active.value)
  } else if (k === 'ArrowLeft') {
    e.preventDefault()
    jumpActive(Math.max(active.value - 1, 0))
  } else if (k === 'ArrowRight') {
    e.preventDefault()
    jumpActive(Math.min(active.value + 1, props.length - 1))
  } else if (k === 'Home') {
    e.preventDefault()
    jumpActive(0)
  } else if (k === 'End') {
    e.preventDefault()
    jumpActive(props.length - 1)
  }
}

function onPaste(e: ClipboardEvent) {
  if (busy()) return
  e.preventDefault()
  insert(e.clipboardData?.getData('text') ?? '')
}

function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  const d = digitsOf(input.value)
  input.value = ''
  if (busy() || !d) return
  insert(d, d.length === 1 ? active.value : 0)
}

function onRowMouseDown(e: MouseEvent) {
  if (props.disabled) return
  e.preventDefault()
  const row = rowRef.value
  if (row && !draining && props.status !== 'success') {
    const rect = row.getBoundingClientRect()
    const zoom = rect.width / (row.offsetWidth || rect.width) || 1
    const i = Math.floor((e.clientX - rect.left) / zoom / pitch.value)
    jumpActive(Math.max(0, Math.min(i, firstEmptyOf(cur))))
  }
  inputRef.value?.focus()
}

watch(
  () => props.length,
  () => {
    glide.clear()
    target = []
    const next = Array.from({ length: props.length }, (_, i) => cur[i] ?? '')
    setSlots(next)
    jumpActive(firstEmptyOf(next))
    const code = next.join('')
    if (code !== emitted) {
      emitted = code
      emit('change', code)
    }
  }
)

watch(
  () => [props.value, props.length],
  () => {
    if (props.value === undefined) return
    const clean = digitsOf(props.value).slice(0, props.length)
    if (clean === emitted) return
    emitted = clean
    const { mvs, drops } = springs.value
    const prev = cur
    const next = toSlots(clean, props.length)
    const hidden = prevStatus === 'success'
    const landing: number[] = []
    const leaving: number[] = []
    next.forEach((ch, i) => {
      if (ch === prev[i]) return
      const bucket = ch ? landing : leaving
      bucket.push(i)
    })
    const step = reduce.value || hidden ? 0 : props.cascade
    landing.forEach((i, k) => land(i, k * step))
    leaving.reverse().forEach((i, k) => {
      if (hidden) {
        target[i] = 0
        mvs[i]!.jump(0)
        drops[i]!.jump(0)
      } else {
        drive(i, 0, k * step)
      }
    })
    setSlots(next)
    moveActive(firstEmptyOf(next), [...landing, ...leaving])
    if (!isFull(prev) && isFull(next)) emit('complete', clean)
  }
)

function syncSuccess(status: PinSlotsStatus) {
  const { drops } = springs.value
  if (status === 'success') {
    veiled.value = true
    if (reduce.value) {
      openMv.jump(1)
      drops.forEach(d => d.jump(1))
      checkMv.jump(1)
      return
    }
    animate(openMv, 1, { duration: WASH_IN, ease: EASE_OUT })
    drops.forEach((d, k) =>
      animate(d, 1, { type: 'spring', duration: 0.3, bounce: 0, delay: SINK_DELAY + k * SINK_STEP })
    )
    animate(checkMv, 1, { type: 'spring', duration: 0.35, bounce: props.bounce, delay: CHECK_DELAY })
    return
  }
  if (prevStatus !== 'success') return
  if (reduce.value) {
    openMv.jump(0)
    checkMv.jump(0)
    drops.forEach(d => d.jump(0))
    veiled.value = false
    return
  }
  animate(checkMv, 0, { duration: 0.15, ease: EASE_OUT })
  animate(openMv, 0, { duration: WASH_OUT, ease: EASE_OUT, delay: 0.06 }).then(() => {
    if (openMv.get() === 0) veiled.value = false
  })
  drops.forEach(d => animate(d, 0, { type: 'spring', duration: 0.3, bounce: 0, delay: 0.1 }))
}

function syncError(status: PinSlotsStatus) {
  if (status !== 'error') return
  const filled = cur.map((c, i) => (c ? i : -1)).filter(i => i >= 0)
  if (!filled.length) return
  filled.reverse()
  draining = true
  const step = reduce.value ? 0 : props.cascade
  filled.forEach((i, k) => drive(i, 0, k * step))
  moveActive(0, cur.map((_, j) => j))
  clearTimeout(drainTimer)
  drainTimer = setTimeout(() => {
    draining = false
    commit(Array.from({ length: props.length }, () => ''))
  }, reduce.value ? 300 : (filled.length - 1) * step + props.settle * 1000)
}

watch(
  () => props.status,
  (status) => {
    syncSuccess(status)
    syncError(status)
    prevStatus = status
  },
  { immediate: true }
)

onUnmounted(() => clearTimeout(drainTimer))

onMounted(() => {
  if (props.autoFocus) inputRef.value?.focus()
})

watch(
  () => props.autoFocus,
  (next) => {
    if (next) inputRef.value?.focus()
  }
)

const view = computed(() =>
  slots.value.length === props.length
    ? slots.value
    : Array.from({ length: props.length }, (_, i) => slots.value[i] ?? '')
)

const showCaret = computed(() =>
  props.caret
  && focused.value
  && !props.disabled
  && !veiled.value
  && props.status !== 'success'
  && (props.status === 'error' || !view.value[active.value])
)

const progress = computed(() => props.status === 'success'
  ? t('pinSlots.accepted')
  : t('pinSlots.progress', { count: view.value.filter(Boolean).length, length: props.length }))

const rootStyle = computed(() => ({
  '--ui-size': `${props.slotSize}px`,
  '--ui-height': `${height.value}px`,
  '--ui-gap': `${props.gap}px`,
  '--ui-radius': `${washRadius()}px`,
  '--ui-font': `${Math.round(props.slotSize * 0.5)}px`,
  '--ui-icon': `${Math.round(props.slotSize * 0.6)}px`
}))
</script>

<template>
  <div
    class="relative inline-block"
    :style="rootStyle"
  >
    <div
      ref="rowRef"
      class="group/row relative inline-flex gap-(--ui-gap) cursor-text touch-manipulation transition-opacity duration-300 data-disabled:opacity-50 data-disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
      :data-status="status"
      :data-focused="focused ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      @mousedown="onRowMouseDown"
    >
      <input
        :id="inputId"
        ref="inputRef"
        :name="name"
        class="absolute inset-0 z-4 m-0 appearance-none border-0 bg-transparent p-0 text-base text-transparent opacity-0 outline-0 caret-transparent cursor-[inherit]"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9]*"
        value=""
        :maxlength="length"
        :aria-label="groupLabel"
        :aria-invalid="status === 'error'"
        :aria-describedby="`${uid}-count`"
        :disabled="disabled"
        :readonly="status === 'success'"
        @keydown="onKeyDown"
        @paste="onPaste"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
      >
      <SPinSlot
        v-for="(ch, i) in view"
        :key="`${length}-${i}`"
        :mv="springs.mvs[i]!"
        :drop="springs.drops[i]!"
        :char="mask && ch ? '•' : ch"
        :active="focused && i === active"
        :rise="rise"
        :sink="Math.round(height * 0.5)"
      />
      <Motion
        as="span"
        class="pointer-events-none absolute inset-0 z-1 grid place-items-center rounded-(--ui-radius) bg-success text-inverted motion-reduce:opacity-0 motion-reduce:in-data-[status=success]:opacity-100 motion-reduce:transition-opacity motion-reduce:duration-200"
        aria-hidden="true"
        :style="{ clipPath: washClip }"
      >
        <Motion
          as="span"
          class="grid place-items-center motion-reduce:transform-none! motion-reduce:transition-opacity motion-reduce:duration-150"
          :style="{ transform: checkTransform, opacity: checkOpacity }"
        >
          <UIcon
            name="i-lucide-check"
            class="size-(--ui-icon)"
          />
        </Motion>
      </Motion>
      <Motion
        as="span"
        class="pointer-events-none absolute top-1/4 left-[calc(var(--ui-size)/2-0.75px)] z-3 h-1/2 w-[1.5px] opacity-0 data-show:opacity-100"
        aria-hidden="true"
        :data-show="showCaret ? '' : undefined"
        :style="{ transform: caretTransform }"
      >
        <span
          :key="active"
          class="block size-full bg-inverted animate-[pin-slots-blink_1s_linear_infinite] motion-reduce:animate-none"
        />
      </Motion>
    </div>
    <span
      :id="`${uid}-count`"
      class="sr-only"
      aria-live="polite"
    >
      {{ progress }}
    </span>
  </div>
</template>

<style>
@keyframes pin-slots-blink {
  0%,
  49.9% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
