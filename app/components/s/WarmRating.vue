<script setup lang="ts">
export type PeekRatingShape = 'star' | 'heart' | 'bolt'
export type PeekRatingColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'

interface PeekRatingProps {
  value?: number
  defaultValue?: number
  count?: number
  shape?: PeekRatingShape
  color?: PeekRatingColor
  labels?: string[]
  size?: number
  lift?: number
  magnify?: number
  riseDuration?: number
  popScale?: number
  showTip?: boolean
  allowClear?: boolean
  readOnly?: boolean
  disabled?: boolean
  ariaLabel?: string
}

interface GestureState {
  hover: number | null
  pressing: boolean
  pointerId: number | null
  settled: boolean
  rect: DOMRect | null
  rtl: boolean
}

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

const SHAPES: Record<PeekRatingShape, string> = {
  star: 'i-lucide-star',
  heart: 'i-lucide-heart',
  bolt: 'i-lucide-zap'
}

const COLORS: Record<PeekRatingColor, string> = {
  primary: 'data-[lit=true]:text-primary focus-visible:outline-primary',
  secondary: 'data-[lit=true]:text-secondary focus-visible:outline-secondary',
  success: 'data-[lit=true]:text-success focus-visible:outline-success',
  info: 'data-[lit=true]:text-info focus-visible:outline-info',
  warning: 'data-[lit=true]:text-warning focus-visible:outline-warning',
  error: 'data-[lit=true]:text-error focus-visible:outline-error'
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function reducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const StarTag = defineComponent({
  name: 'StarTag',
  props: {
    tag: {
      type: String,
      default: 'button'
    }
  },
  setup(p, { slots, attrs }) {
    return () => h(p.tag, attrs, slots.default?.())
  }
})

function elOf(el: unknown) {
  return ((el as { $el?: HTMLElement } | null)?.$el ?? null) as HTMLElement | null
}

const props = withDefaults(defineProps<PeekRatingProps>(), {
  value: undefined,
  defaultValue: 0,
  count: 5,
  shape: 'heart',
  color: 'warning',
  labels: () => [],
  size: 28,
  lift: 6,
  magnify: 1.15,
  riseDuration: 320,
  popScale: 1.3,
  showTip: true,
  allowClear: true,
  readOnly: false,
  disabled: false,
  ariaLabel: undefined
})

const emit = defineEmits<{
  change: [value: number]
  preview: [value: number | null]
}>()

const { t } = useI18n()

const inner = ref(props.defaultValue)
const current = computed(() => clamp(props.value ?? inner.value, 0, props.count))
const interactive = computed(() => !props.readOnly && !props.disabled)

const rootRef = useTemplateRef<HTMLDivElement>('rootRef')
const rowRef = useTemplateRef<HTMLDivElement>('rowRef')
const tipEl = useTemplateRef<HTMLSpanElement>('tipEl')
const starEls: (HTMLElement | null)[] = []
const liftEls: (HTMLSpanElement | null)[] = []
const glyphEls: (HTMLSpanElement | null)[] = []
const st: GestureState = { hover: null, pressing: false, pointerId: null, settled: false, rect: null, rtl: false }

function paint() {
  const { hover, settled, rtl } = st
  const previewing = hover !== null && !settled
  const shown = previewing ? (hover as number) + 1 : current.value
  const still = reducedMotion()

  for (let i = 0; i < props.count; i++) {
    const liftEl = liftEls[i]
    const glyphEl = glyphEls[i]
    if (!liftEl || !glyphEl) continue
    const lifted = previewing && !still && i <= (hover as number)
    liftEl.style.transform = lifted
      ? `translateY(${-props.lift}px) scale(${i === hover ? props.magnify : 1})`
      : 'translateY(0px) scale(1)'
    glyphEl.dataset.lit = String(i < shown)
  }

  const tip = tipEl.value
  if (!tip) return
  if (previewing && props.showTip) {
    const row = rowRef.value
    const slot = row ? row.clientWidth / props.count : props.size
    const visual = rtl ? props.count - 1 - (hover as number) : (hover as number)
    const wasHidden = tip.dataset.show !== 'true'
    if (wasHidden) tip.style.transition = 'none'
    tip.textContent = props.labels[hover as number] ?? String((hover as number) + 1)
    tip.style.transform = `translate(calc(${slot * (visual + 0.5)}px - 50%), 0)`
    if (wasHidden) {
      void tip.offsetWidth
      tip.style.transition = ''
    }
    tip.dataset.show = 'true'
  } else {
    tip.dataset.show = 'false'
  }
}
watchPostEffect(paint)

function setHover(index: number | null) {
  if (index === st.hover) return
  st.hover = index
  if (index !== null) st.settled = false
  paint()
  emit('preview', index === null ? null : index + 1)
}

function measure() {
  const row = rowRef.value
  if (!row) return
  st.rect = row.getBoundingClientRect()
  st.rtl = getComputedStyle(row).direction === 'rtl'
}

function indexAt(x: number, y: number): number | null {
  const { rect, pressing, rtl } = st
  if (!rect || !rect.width) return null
  if (pressing && (y < rect.top - props.size || y > rect.bottom + props.size)) return null
  const index = clamp(Math.floor(((x - rect.left) / rect.width) * props.count), 0, props.count - 1)
  return rtl ? props.count - 1 - index : index
}

function commit(next: number, pop = true) {
  if (props.value === undefined) inner.value = next
  emit('change', next)
  st.settled = true
  paint()
  const glyph = glyphEls[next - 1]
  if (pop && next > 0 && props.popScale > 1 && glyph && typeof glyph.animate === 'function' && !reducedMotion()) {
    glyph.getAnimations().forEach(animation => animation.cancel())
    glyph.animate(
      [
        { transform: 'scale(1)', easing: EASE_OUT },
        { transform: `scale(${props.popScale})`, offset: 0.35, easing: EASE_OUT },
        { transform: 'scale(1)' }
      ],
      { duration: 300 }
    )
  }
}

function onPointerEnter(e: PointerEvent) {
  if (!interactive.value || e.pointerType !== 'mouse') return
  rootRef.value?.removeAttribute('data-instant')
  measure()
}

function onPointerDown(e: PointerEvent) {
  if (!interactive.value || e.button !== 0 || st.pointerId !== null) return
  rootRef.value?.removeAttribute('data-instant')
  try {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {
    st.rect = null
  }
  st.pointerId = e.pointerId
  st.pressing = true
  measure()
  setHover(indexAt(e.clientX, e.clientY))
}

function onPointerMove(e: PointerEvent) {
  if (!interactive.value) return
  const { pressing, pointerId } = st
  if (e.pointerType !== 'mouse' && !pressing) return
  if (pressing && e.pointerId !== pointerId) return
  if (!pressing && !st.rect) measure()
  setHover(indexAt(e.clientX, e.clientY))
}

function endPress(e: PointerEvent) {
  const { pressing, pointerId, hover } = st
  if (!pressing || e.pointerId !== pointerId) return
  st.pressing = false
  st.pointerId = null
  if (e.type === 'pointerup' && hover !== null) {
    const next = hover + 1
    commit(props.allowClear && next === current.value ? 0 : next)
  }
  if (e.pointerType !== 'mouse') setHover(null)
}

function onPointerLeave() {
  if (!st.pressing) setHover(null)
}

function onKeyDown(e: KeyboardEvent) {
  if (!interactive.value) return
  const min = props.allowClear ? 0 : 1
  let next: number
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = clamp(current.value + 1, min, props.count)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = clamp(current.value - 1, min, props.count)
      break
    case 'Home':
      next = 1
      break
    case 'End':
      next = props.count
      break
    case 'Backspace':
    case 'Delete':
      if (!props.allowClear) return
      next = 0
      break
    case ' ':
    case 'Enter': {
      const index = starEls.indexOf(e.target as HTMLElement)
      if (index === -1) return
      next = props.allowClear && index + 1 === current.value ? 0 : index + 1
      break
    }
    default:
      return
  }
  e.preventDefault()
  rootRef.value?.setAttribute('data-instant', 'true')
  st.hover = null
  commit(next, false)
  starEls[Math.max(next, 1) - 1]?.focus()
}

function reset() {
  st.pressing = false
  st.pointerId = null
  setHover(null)
}

function onVisibility() {
  if (document.hidden) reset()
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('blur', reset)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('blur', reset)
})

const indexes = computed(() => Array.from({ length: props.count }, (_, i) => i))
const shapeIcon = computed(() => SHAPES[props.shape] ?? SHAPES.star)
const colorClass = computed(() => COLORS[props.color] ?? COLORS.warning)
const tipRoom = computed(() => (interactive.value && props.showTip ? Math.round(props.size * 0.9) : 0))
const groupLabel = computed(() => props.ariaLabel ?? t('warmRating.label'))

const rootStyle = computed(() => ({
  '--ui-size': `${props.size}px`,
  '--ui-gap': `${Math.round(props.size * 0.22)}px`,
  '--ui-room': `${props.lift + tipRoom.value}px`,
  '--ui-rise': `${props.riseDuration}ms`,
  '--ui-ease-out': EASE_OUT
}))

function labelFor(i: number) {
  const label = props.labels[i]
  return label
    ? t('warmRating.itemLabel', { n: i + 1, count: props.count, label })
    : t('warmRating.item', { n: i + 1, count: props.count })
}

function tabIndexFor(i: number) {
  if (!interactive.value) return -1
  return (current.value === 0 ? i === 0 : current.value === i + 1) ? 0 : -1
}
</script>

<template>
  <div
    ref="rootRef"
    :role="readOnly ? 'img' : 'radiogroup'"
    :aria-label="readOnly ? t('warmRating.item', { n: current, count }) : groupLabel"
    :aria-disabled="disabled || undefined"
    class="group inline-flex font-[inherit] text-inherit aria-disabled:opacity-50 aria-disabled:pointer-events-none"
    :style="rootStyle"
    @keydown="onKeyDown"
  >
    <div
      ref="rowRef"
      class="relative inline-flex items-end pt-(--ui-room) select-none touch-pan-y [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
      @pointerenter="onPointerEnter"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endPress"
      @pointercancel="endPress"
      @lostpointercapture="endPress"
      @pointerleave="onPointerLeave"
    >
      <span
        v-if="interactive && showTip"
        ref="tipEl"
        class="absolute top-0 left-0 inline-flex items-center h-[calc(var(--ui-size)*0.6)] px-[calc(var(--ui-size)*0.3)] rounded-full bg-primary/80 text-inverted font-semibold text-[calc(var(--ui-size)*0.38)] leading-none tracking-[0.01em] whitespace-nowrap shadow-md opacity-0 data-[show=true]:opacity-100 pointer-events-none [transition:transform_var(--ui-rise)_var(--ui-ease-out),opacity_180ms_ease] group-data-[instant=true]:duration-[0ms] motion-reduce:[transition:opacity_180ms_ease]"
        aria-hidden="true"
      />
      <StarTag
        v-for="i in indexes"
        :key="i"
        :ref="(el: unknown) => (starEls[i] = elOf(el))"
        :tag="readOnly ? 'span' : 'button'"
        :type="readOnly ? undefined : 'button'"
        class="grid place-items-center m-0 p-0 border-0 bg-transparent outline-none w-[calc(var(--ui-size)+var(--ui-gap))] h-[calc(var(--ui-size)+8px)] font-[inherit] text-inherit touch-manipulation focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 pointer-fine:cursor-pointer pointer-coarse:min-h-11 pointer-coarse:min-w-11"
        :class="colorClass"
        :role="readOnly ? undefined : 'radio'"
        :aria-checked="readOnly ? undefined : current === i + 1"
        :aria-label="readOnly ? undefined : labelFor(i)"
        :aria-hidden="readOnly || undefined"
        :tabindex="tabIndexFor(i)"
      >
        <span
          :ref="(el: unknown) => (liftEls[i] = el as HTMLSpanElement | null)"
          class="block origin-bottom transition-transform duration-(--ui-rise) ease-(--ui-ease-out) group-data-[instant=true]:duration-0 motion-reduce:transition-none"
        >
          <span
            :ref="(el: unknown) => (glyphEls[i] = el as HTMLSpanElement | null)"
            class="block size-(--ui-size) text-muted transition-colors duration-150 group-data-[instant=true]:duration-0 *:block *:size-full"
            :class="colorClass"
          >
            <slot name="icon">
              <UIcon
                :name="shapeIcon"
                class="fill-current"
              />
            </slot>
          </span>
        </span>
      </StarTag>
    </div>
  </div>
</template>
