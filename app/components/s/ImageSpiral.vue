<script setup lang="ts">
export interface InfiniteSpiralItem {
  id?: string | number
  src: string
  alt?: string
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  label?: string
}

interface NormalizedItem extends InfiniteSpiralItem {
  alt: string
}

interface InfiniteSpiralProps {
  items?: Array<string | InfiniteSpiralItem>
  speed?: number
  direction?: 'up' | 'down'
  animationMode?: 'auto' | 'drag' | 'scroll' | 'all'
  radius?: number
  cardWidth?: number
  cardHeight?: number
  verticalSpacing?: number
  perspective?: number
  cardsPerTurn?: number
  rotation?: number
  cardTilt?: number
  cardRadius?: number
  centerScale?: number
  edgeFade?: number
  edgeBlur?: number
  pauseOnHover?: boolean
  imageFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  grayscale?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor
}

function smoothstep(min: number, max: number, value: number) {
  const x = clamp((value - min) / (max - min || 1), 0, 1)
  return x * x * (3 - 2 * x)
}

const props = withDefaults(defineProps<InfiniteSpiralProps>(), {
  items: () => [],
  speed: 0.55,
  direction: 'up',
  animationMode: 'auto',
  radius: 170,
  cardWidth: 100,
  cardHeight: 100,
  verticalSpacing: 60,
  perspective: 1000,
  cardsPerTurn: 7,
  rotation: 0,
  cardTilt: 0,
  cardRadius: 10,
  centerScale: 1.2,
  edgeFade: 0.3,
  edgeBlur: 6,
  pauseOnHover: true,
  imageFit: 'cover',
  grayscale: 0
})

const { t } = useI18n()
const rootRef = useTemplateRef<HTMLDivElement>('rootRef')

const normalizedItems = computed<NormalizedItem[]>(() =>
  props.items.map((item, index) => {
    const alt = t('infiniteSpiral.image', { n: index + 1 })
    return typeof item === 'string' ? { src: item, alt } : { alt, ...item }
  })
)

let progress = 0
let targetProgress = 0
let autoSpeed = 0
let hovered = false
let visible = true
let dragging = false
let lastPointerY = 0
let dragMoved = false
let teardown: (() => void) | null = null
const grabbing = ref(false)
const cardEls: (HTMLElement | null)[] = []

const dragEnabled = computed(() => props.animationMode === 'drag' || props.animationMode === 'all')

function setupAnimation() {
  const root = rootRef.value
  if (!root || normalizedItems.value.length === 0) return

  let frameId = 0
  let previousTime = performance.now()
  let bounds = root.getBoundingClientRect()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const scrollEnabled = props.animationMode === 'scroll' || props.animationMode === 'all'
  const scrollSpeedMultiplier = Math.max(props.speed, 0) / 0.55
  let lastScrollY = window.scrollY

  const resizeObserver = new ResizeObserver(() => {
    bounds = root.getBoundingClientRect()
  })
  resizeObserver.observe(root)

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
  })
  intersectionObserver.observe(root)

  function handleScroll() {
    const nextScrollY = window.scrollY
    const scrollDelta = nextScrollY - lastScrollY
    lastScrollY = nextScrollY
    if (!scrollEnabled || !visible || scrollDelta === 0) return
    targetProgress += clamp((scrollDelta * scrollSpeedMultiplier) / Math.max(props.verticalSpacing * 2, 1), -1.5, 1.5)
  }
  window.addEventListener('scroll', handleScroll, { passive: true })

  function render(time: number) {
    const delta = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time
    const autoEnabled = props.animationMode === 'auto' || props.animationMode === 'all'
    const motionPaused = dragging || (props.pauseOnHover && hovered)
    const directionMultiplier = props.direction === 'down' ? -1 : 1
    const desiredAutoSpeed
      = autoEnabled && visible && !reducedMotion.matches && !motionPaused ? props.speed * directionMultiplier : 0
    autoSpeed += (desiredAutoSpeed - autoSpeed) * (1 - Math.exp(-delta * 7))
    targetProgress += autoSpeed * delta

    progress += (targetProgress - progress) * (1 - Math.exp(-delta * (dragging ? 22 : 11)))

    const count = normalizedItems.value.length
    const half = count / 2
    const width = Math.max(bounds.width, 1)
    const height = Math.max(bounds.height, 1)
    const fit = Math.min(1, width / (props.cardWidth * 2.8), height / (props.cardHeight * 2.35))
    const responsiveRadius = Math.min(props.radius, Math.max(72, width * 0.36)) * fit
    const fadeStart = clamp(1 - props.edgeFade, 0, 0.98)
    const turnSize = Math.max(props.cardsPerTurn, 1)

    cardEls.forEach((card, index) => {
      if (!card) return
      const offset = modulo(index - progress + half, count) - half
      const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1)
      const opacity = 1 - smoothstep(fadeStart, 1, edge)
      const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1)
      const scale = (1 + (props.centerScale - 1) * focus) * fit
      const angleRadians = ((offset * (360 / turnSize) + props.rotation) * Math.PI) / 180
      const x = Math.sin(angleRadians) * responsiveRadius
      const z = Math.cos(angleRadians) * responsiveRadius
      const depthScale = clamp(props.perspective / Math.max(props.perspective - z, 1), 0.72, 1.45)
      const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2
      const blur = props.edgeBlur * smoothstep(0.35, 1, edge)
      card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * props.verticalSpacing * fit}px, 0) rotateZ(${props.cardTilt}deg) scale(${scale * depthScale})`
      card.style.opacity = opacity.toFixed(3)
      card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none'
      card.style.zIndex = String(Math.round(depth * 100000) + index)
      card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none'
    })
    frameId = requestAnimationFrame(render)
  }

  frameId = requestAnimationFrame(render)

  teardown = () => {
    cancelAnimationFrame(frameId)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    window.removeEventListener('scroll', handleScroll)
  }
}

onMounted(setupAnimation)

onUnmounted(() => {
  teardown?.()
  teardown = null
})

watch(
  () => [
    normalizedItems.value,
    props.speed,
    props.direction,
    props.animationMode,
    props.radius,
    props.perspective,
    props.cardWidth,
    props.cardHeight,
    props.verticalSpacing,
    props.cardsPerTurn,
    props.rotation,
    props.cardTilt,
    props.centerScale,
    props.edgeFade,
    props.edgeBlur,
    props.pauseOnHover
  ],
  () => {
    teardown?.()
    teardown = null
    setupAnimation()
  }
)

function onEnter() {
  hovered = true
}

function onLeave() {
  hovered = false
}

function stopDragging(event: PointerEvent) {
  if (!dragging) return
  dragging = false
  grabbing.value = false
  const target = event.currentTarget as HTMLDivElement
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
}

function handlePointerDown(event: PointerEvent) {
  if (!dragEnabled.value || event.button !== 0) return
  dragging = true
  dragMoved = false
  grabbing.value = true
  lastPointerY = event.clientY
  targetProgress = progress
  ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  if (!dragging) return
  const pointerDelta = event.clientY - lastPointerY
  lastPointerY = event.clientY
  if (Math.abs(pointerDelta) > 0.5) dragMoved = true
  targetProgress -= pointerDelta / Math.max(props.verticalSpacing, 1)
}

function handleClickCapture(event: MouseEvent) {
  if (!dragMoved) return
  event.preventDefault()
  event.stopPropagation()
  dragMoved = false
}

const rootStyle = computed(() => ({
  'perspective': `${props.perspective}px`,
  '--spiral-width': `${props.cardWidth}px`,
  '--spiral-height': `${props.cardHeight}px`,
  '--spiral-radius': `${props.cardRadius}px`
}))

const imageStyle = computed(() => ({
  objectFit: props.imageFit,
  filter: `grayscale(${clamp(props.grayscale, 0, 1)})`
}))
</script>

<template>
  <div
    ref="rootRef"
    class="relative isolate size-full min-h-80 overflow-hidden"
    :class="dragEnabled ? [grabbing ? 'cursor-grabbing' : 'cursor-grab', 'touch-pan-x select-none'] : undefined"
    :style="rootStyle"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="stopDragging"
    @pointercancel="stopDragging"
    @click.capture="handleClickCapture"
  >
    <div
      class="absolute inset-0 transform-3d"
      role="list"
      :aria-label="t('infiniteSpiral.label')"
    >
      <component
        :is="item.href ? 'a' : 'div'"
        v-for="(item, index) in normalizedItems"
        :key="item.id ?? `${item.src}-${index}`"
        :ref="(el: unknown) => (cardEls[index] = el as HTMLElement | null)"
        class="absolute top-1/2 left-1/2 block h-(--spiral-height) w-(--spiral-width) overflow-hidden rounded-(--spiral-radius) border border-primary/30 bg-primary/10 shadow-md shadow-primary backface-hidden transform-3d will-change-[transform,opacity,filter]"
        :href="item.href"
        :target="item.href ? item.target : undefined"
        :rel="item.href && item.target === '_blank' ? 'noreferrer' : undefined"
        role="listitem"
        :aria-label="item.label ?? item.alt"
      >
        <img
          class="absolute inset-0 block size-full max-w-none max-h-none object-center select-none"
          :src="item.src"
          :alt="item.alt"
          :loading="index < 6 ? 'eager' : 'lazy'"
          :draggable="false"
          :style="imageStyle"
        >
      </component>
    </div>
  </div>
</template>
