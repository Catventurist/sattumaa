<script setup lang="ts">
import { animate, motionValue, useReducedMotion } from 'motion-v'
import type { CSSProperties } from 'vue'

type SwipeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export interface SwipeAction {
  id: string
  label: string
  icon?: string
  color?: SwipeColor
  dismiss?: boolean
}

interface SwipeRowProps {
  actions?: SwipeAction[]
  color?: SwipeColor
  height?: number
  radius?: number
  actionWidth?: number
  direction?: 'left' | 'right'
  snapBounce?: number
  resistance?: number
  collapseMs?: number
  commitAt?: number
  fullSwipe?: boolean
  disabled?: boolean
  closeOnAction?: boolean
  haptic?: boolean
  label?: string
}

type Sample = [number, number]
type Phase = 'idle' | 'committing' | 'collapsing'

interface Grip {
  id: number
  x0: number
  y0: number
  grab: number | null
  moved: boolean
  hist: Sample[]
  touch: boolean
}

const COLORS: Record<SwipeColor, string> = {
  primary: 'bg-primary/60 text-inverted',
  secondary: 'bg-secondary/60 text-inverted',
  success: 'bg-success/60 text-inverted',
  info: 'bg-info/60 text-inverted',
  warning: 'bg-warning/60 text-inverted',
  error: 'bg-error/60 text-inverted',
  neutral: 'bg-accented/60 text-highlighted'
}

const HYST = 10
const FLICK = 110
const DECEL = 0.998
const VMAX = 1500
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const rubber = (o: number, dim: number, c: number) => (o * dim * c) / (dim + c * Math.abs(o))
const unrubber = (y: number, dim: number, c: number) => (y * dim) / (c * Math.max(1, dim - Math.abs(y)))
const project = (v: number) => ((v / 1000) * DECEL) / (1 - DECEL)
const velocityOf = (hist: Sample[]) => {
  if (hist.length < 2) return 0
  const a = hist[0]!
  const b = hist[hist.length - 1]!
  return ((b[1] - a[1]) / Math.max(1, b[0] - a[0])) * 1000
}

const props = withDefaults(defineProps<SwipeRowProps>(), {
  actions: undefined,
  color: 'error',
  height: 64,
  radius: 16,
  actionWidth: 80,
  direction: undefined,
  snapBounce: 0.2,
  resistance: 0.55,
  collapseMs: 200,
  commitAt: 0.6,
  fullSwipe: true,
  disabled: false,
  closeOnAction: true,
  haptic: true,
  label: undefined
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  action: [action: SwipeAction]
  commit: [action: SwipeAction]
}>()

const { t, localeProperties } = useI18n()
const uid = useId()
const reduce = useReducedMotion()

const dir = computed(() => props.direction ?? (localeProperties.value?.dir === 'rtl' ? 'right' : 'left'))
const acts = computed<SwipeAction[]>(() => props.actions ?? [{ id: 'delete', label: t('swipe.delete') }])
const s = computed(() => (dir.value === 'left' ? -1 : 1))
const A = computed(() => props.actionWidth)
const n = computed(() => acts.value.length)
const D = computed(() => n.value * A.value)
const c = computed(() => clamp(props.resistance, 0.05, 1))
const primary = computed(() => acts.value[0])
const secondary = computed(() => acts.value.slice(1))

const phase = ref<Phase>('idle')
const say = ref('')

const rootRef = ref<HTMLDivElement | null>(null)
const surfaceRef = ref<HTMLDivElement | null>(null)
const railRef = ref<HTMLDivElement | null>(null)
const blockRef = ref<HTMLDivElement | null>(null)
const glyphRef = ref<HTMLButtonElement | null>(null)

let w = 360
let grip: Grip | null = null
let foldTimer: ReturnType<typeof setTimeout> | undefined
let heading: number | null = null
let unwatch: (() => void) | null = null
let observer: ResizeObserver | null = null
const offs: (() => void)[] = []

const x = motionValue(0)
const spread = motionValue(0)
const landed = motionValue(0)
const exposed = () => s.value * x.get()
const commitPoint = () => Math.max(props.commitAt * w, D.value + A.value / 2)
const canCommit = () => props.fullSwipe && n.value > 0 && commitPoint() <= w

const paint = () => {
  const sv = s.value
  const e = exposed()
  const shift = spread.get() * Math.max(0, e - A.value)
  if (surfaceRef.value) surfaceRef.value.style.transform = `translateX(${x.get()}px)`
  if (railRef.value) railRef.value.style.transform = `translateX(${-sv * Math.max(0, D.value - e)}px)`
  if (blockRef.value) blockRef.value.style.transform = `translateX(${sv * shift}px)`
  if (glyphRef.value)
    glyphRef.value.style.transform = `translateX(${-sv * landed.get() * (shift - (w - A.value) / 2)}px)`
}

const map = (raw: number) => {
  const W = w
  const cc = c.value
  const d = D.value
  if (raw < 0) return rubber(raw, W, cc)
  if (raw <= d) return raw
  if (!canCommit()) return d + rubber(raw - d, W, cc)
  const C = commitPoint()
  const knee = d + (C - d) / cc
  return raw <= knee ? d + cc * (raw - d) : C + rubber(raw - knee, W, cc)
}
const inv = (ex: number) => {
  const W = w
  const cc = c.value
  const d = D.value
  if (ex < 0) return unrubber(ex, W, cc)
  if (ex <= d) return ex
  if (!canCommit()) return d + unrubber(ex - d, W, cc)
  const C = commitPoint()
  const knee = d + (C - d) / cc
  return ex <= C ? d + (ex - d) / cc : knee + unrubber(ex - C, W, cc)
}

onMounted(() => {
  const el = rootRef.value
  if (el) {
    w = el.offsetWidth || w
    observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) w = width
    })
    observer.observe(el)
  }
  if (open.value) {
    heading = D.value
    x.jump(s.value * D.value)
  }
  paint()
  offs.push(x.on('change', paint), spread.on('change', paint), landed.on('change', paint))
})
watch([s, A, D], paint, { flush: 'post' })
onUnmounted(() => {
  clearTimeout(foldTimer)
  unwatch?.()
  observer?.disconnect()
  offs.forEach(off => off())
  x.stop()
  spread.stop()
  landed.stop()
})

const setOpen = (next: boolean) => {
  if (next === open.value) return
  open.value = next
}
const settle = (target: number, v = 0) => {
  heading = target
  const sv = s.value
  if (reduce.value) {
    animate(x, sv * target, { duration: 0.2, ease: EASE_OUT })
    return
  }
  const flick = Math.abs(v) >= FLICK
  animate(
    x,
    sv * target,
    flick
      ? { type: 'spring', duration: 0.4, bounce: props.snapBounce, velocity: sv * clamp(v, -VMAX, VMAX) }
      : { ...SPRING_UI, velocity: sv * v }
  )
}
const setSpread = (on: boolean) => {
  if ((spread.get() === 1) === on) return
  if (reduce.value) spread.set(on ? 1 : 0)
  else animate(spread, on ? 1 : 0, SPRING_UI)
  if (on && primary.value) {
    say.value = t('swipe.release', { action: primary.value.label })
    if (props.haptic && grip?.touch) navigator.vibrate?.(8)
  }
}
const commit = (a: SwipeAction, viaKey: boolean, v = 0) => {
  const leap = a === primary.value
  const sv = s.value
  phase.value = 'committing'
  say.value = a.label
  setOpen(false)
  const fold = () => {
    phase.value = 'collapsing'
    foldTimer = setTimeout(() => emit('commit', a), props.collapseMs)
  }
  if (viaKey || reduce.value) {
    if (leap) {
      spread.set(1)
      landed.set(1)
    }
    if (viaKey) {
      x.set(sv * w)
      fold()
    } else animate(x, sv * w, { duration: 0.2, ease: EASE_OUT }).then(fold)
    return
  }
  if (leap) {
    if (spread.get() < 1) animate(spread, 1, SPRING_UI)
    animate(landed, 1, SPRING_UI)
  }
  animate(x, sv * w, { ...SPRING_UI, velocity: sv * v }).then(fold)
}

const reset = () => {
  clearTimeout(foldTimer)
  x.stop()
  x.jump(0)
  spread.jump(0)
  landed.jump(0)
  heading = 0
  phase.value = 'idle'
  say.value = ''
  setOpen(false)
}

watch(
  [open, D],
  () => {
    if (grip || phase.value !== 'idle') return
    const target = open.value ? D.value : 0
    if (heading === target) return
    if (Math.abs(exposed() - target) > 0.5) settle(target)
  },
  { flush: 'post' }
)

const move = (e: PointerEvent) => {
  const g = grip
  if (!g || g.id !== e.pointerId) return
  const sv = s.value
  if (g.grab === null) {
    const dx = e.clientX - g.x0
    const dy = e.clientY - g.y0
    if (Math.abs(dx) < HYST || Math.abs(dx) < Math.abs(dy)) return
    g.grab = sv * (g.x0 + Math.sign(dx) * HYST) - inv(exposed())
    g.moved = true
    rootRef.value?.setAttribute('data-dragging', '')
    try {
      surfaceRef.value?.setPointerCapture(g.id)
    } catch {
      // capture unavailable
    }
  }
  const ex = map(sv * e.clientX - g.grab)
  x.set(sv * ex)
  g.hist.push([performance.now(), ex])
  if (g.hist.length > 4) g.hist.shift()
  setSpread(canCommit() && ex >= commitPoint())
}
const up = (e: PointerEvent) => {
  const g = grip
  if (!g || g.id !== e.pointerId) return
  grip = null
  unwatch?.()
  unwatch = null
  rootRef.value?.removeAttribute('data-dragging')
  try {
    surfaceRef.value?.releasePointerCapture(e.pointerId)
  } catch {
    // not captured
  }
  const ex = exposed()
  const v = velocityOf(g.hist)
  if (!g.moved) {
    if (open.value) {
      setOpen(false)
      settle(0)
    }
    return
  }
  if (primary.value && canCommit() && ex >= commitPoint()) {
    commit(primary.value, false, v)
    return
  }
  const d = D.value
  const target = Math.abs(v) >= FLICK ? (v > 0 ? d : 0) : ex + project(v) > d / 2 ? d : 0
  setSpread(false)
  setOpen(target === d)
  settle(target, v)
}
const watchWindow = () => {
  const onMove = (e: PointerEvent) => {
    if (e.isTrusted) move(e)
  }
  const onUp = (e: PointerEvent) => {
    if (e.isTrusted) up(e)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }
}
const down = (e: PointerEvent) => {
  if (props.disabled || n.value === 0 || phase.value !== 'idle' || grip || e.button !== 0) return
  x.stop()
  heading = null
  grip = {
    id: e.pointerId,
    x0: e.clientX,
    y0: e.clientY,
    grab: null,
    moved: false,
    hist: [],
    touch: e.pointerType === 'touch'
  }
  unwatch?.()
  unwatch = watchWindow()
}

const act = (a: SwipeAction, e: MouseEvent) => {
  if (phase.value !== 'idle') return
  emit('action', a)
  if (a === primary.value || a.dismiss) {
    commit(a, e.detail === 0)
    return
  }
  if (!props.closeOnAction) return
  setOpen(false)
  if (e.detail === 0) {
    heading = 0
    x.set(0)
  } else settle(0)
}
const openNow = async () => {
  heading = D.value
  x.set(s.value * D.value)
  setOpen(true)
  say.value = t('swipe.revealed', { count: n.value })
  await nextTick()
  railRef.value?.querySelector<HTMLButtonElement>('button')?.focus()
}
const closeNow = () => {
  heading = 0
  x.set(0)
  setOpen(false)
}
const onToggleKey = (e: KeyboardEvent) => {
  if (props.disabled || phase.value !== 'idle' || n.value === 0) return
  const left = s.value < 0
  const openKey = left ? 'ArrowLeft' : 'ArrowRight'
  const closeKey = left ? 'ArrowRight' : 'ArrowLeft'
  const toggle = e.key === 'Enter' || e.key === ' '
  if (e.key === openKey || (toggle && !open.value)) {
    e.preventDefault()
    openNow()
  } else if (e.key === closeKey || e.key === 'Escape' || (toggle && open.value)) {
    e.preventDefault()
    closeNow()
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && open.value && primary.value && canCommit()) {
    e.preventDefault()
    commit(primary.value, true)
  }
}
const onToggleClick = (e: MouseEvent) => {
  if (e.detail !== 0 || props.disabled || phase.value !== 'idle' || n.value === 0) return
  if (open.value) closeNow()
  else openNow()
}

const railId = computed(() => `${uid}-rail`)
const colorClass = (value: SwipeColor = 'neutral') => COLORS[value]
const secondaryStyle = (i: number): CSSProperties => ({
  [s.value < 0 ? 'right' : 'left']: `${(i + 1) * A.value}px`
})

const rootStyle = computed(() => ({
  '--ui-h': `${props.height}px`,
  '--ui-r': `${props.radius}px`,
  '--ui-a': `${A.value}px`,
  '--ui-collapse': `${props.collapseMs}ms`
}) as CSSProperties)

defineExpose({ reset, close: closeNow })
</script>

<template>
  <div
    ref="rootRef"
    role="group"
    :aria-label="label ?? t('swipe.listItem')"
    class="group relative h-(--ui-h) overflow-hidden transition-[height,margin-bottom,opacity] duration-(--ui-collapse) ease-[cubic-bezier(0.23,1,0.32,1)] data-disabled:pointer-events-none data-disabled:opacity-55 data-[phase=collapsing]:mb-0! data-[phase=collapsing]:h-0! data-[phase=collapsing]:opacity-0"
    :data-direction="dir"
    :data-open="open ? '' : undefined"
    :data-phase="phase"
    :data-disabled="disabled ? '' : undefined"
    :style="rootStyle"
  >
    <div class="relative h-(--ui-h) overflow-hidden rounded-(--ui-r) bg-elevated">
      <div
        :id="railId"
        ref="railRef"
        class="absolute inset-0 bg-accented"
        :inert="!open || undefined"
      >
        <button
          v-for="(a, i) in secondary"
          :key="a.id"
          type="button"
          class="group/action absolute top-0 grid h-full w-(--ui-a) cursor-pointer touch-manipulation select-none place-items-center border-0 p-0 outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [font:inherit] after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:content-[''] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current [@media(hover:hover)_and_(pointer:fine)]:after:transition-opacity [@media(hover:hover)_and_(pointer:fine)]:hover:after:opacity-[0.08]"
          :class="colorClass(a.color)"
          :style="secondaryStyle(i)"
          @click="act(a, $event)"
        >
          <span class="grid justify-items-center gap-1 text-[11px] leading-none font-medium tracking-[0.01em] transition-transform duration-150 group-active/action:scale-[0.97] motion-reduce:group-active/action:transform-none">
            <UIcon
              v-if="a.icon"
              :name="a.icon"
              class="size-5"
            />
            <span>{{ a.label }}</span>
          </span>
        </button>

        <div
          v-if="primary"
          ref="blockRef"
          class="absolute top-0 h-full w-full group-data-[direction=left]:left-[calc(100%-var(--ui-a))] group-data-[direction=right]:right-[calc(100%-var(--ui-a))]"
          :class="colorClass(color)"
        >
          <button
            ref="glyphRef"
            type="button"
            class="group/action absolute top-0 grid h-full w-(--ui-a) cursor-pointer touch-manipulation select-none place-items-center border-0 bg-transparent p-0 text-inherit outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [font:inherit] group-data-[direction=left]:left-0 group-data-[direction=right]:right-0 after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:content-[''] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current [@media(hover:hover)_and_(pointer:fine)]:after:transition-opacity [@media(hover:hover)_and_(pointer:fine)]:hover:after:opacity-[0.08]"
            @click="act(primary, $event)"
          >
            <span class="grid justify-items-center gap-1 text-[11px] leading-none font-medium tracking-[0.01em] transition-transform duration-150 group-active/action:scale-[0.97] motion-reduce:group-active/action:transform-none">
              <UIcon
                :name="primary.icon ?? 'i-lucide-trash-2'"
                class="size-5"
              />
              <span>{{ primary.label }}</span>
            </span>
          </button>
        </div>
      </div>

      <div
        ref="surfaceRef"
        class="relative z-1 flex h-full touch-pan-y items-center gap-3 bg-elevated px-4 text-default [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] group-data-dragging:select-none group-data-dragging:*:select-none [@media(hover:hover)_and_(pointer:fine)]:cursor-grab [@media(hover:hover)_and_(pointer:fine)]:group-data-dragging:cursor-grabbing pointer-coarse:select-none"
        @pointerdown="down"
      >
        <slot />

        <button
          type="button"
          class="absolute top-1/2 m-0 h-px w-px overflow-hidden border-0 bg-transparent p-0 text-default outline-none [clip-path:inset(50%)] [font:inherit] group-data-[direction=left]:right-3 group-data-[direction=right]:left-3 focus-visible:h-6 focus-visible:w-auto focus-visible:-translate-y-1/2 focus-visible:overflow-visible focus-visible:rounded-xl focus-visible:bg-accented focus-visible:px-2.5 focus-visible:text-xs focus-visible:whitespace-nowrap focus-visible:[clip-path:none]"
          :tabindex="disabled ? -1 : 0"
          :aria-expanded="open"
          :aria-controls="railId"
          :aria-keyshortcuts="s < 0 ? 'ArrowLeft' : 'ArrowRight'"
          @keydown="onToggleKey"
          @click="onToggleClick"
        >
          {{ t('swipe.actions', n) }}
        </button>
      </div>
    </div>

    <span
      class="sr-only"
      aria-live="polite"
    >{{ say }}</span>
  </div>
</template>
