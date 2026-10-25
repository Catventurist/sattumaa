<script setup lang="ts">
import { ref, computed } from 'vue'

interface Dot {
  id: string
  x: number
  y: number
}

interface DragState {
  source: string
  x: number
  y: number
}

const props = withDefaults(defineProps<{
  dots?: Dot[]
  freehand?: boolean
  viewBox?: string
  strokeWidth?: number
  dotRadius?: number
}>(), {
  dots: () => [],
  freehand: false,
  viewBox: '0 0 400 300',
  strokeWidth: 2,
  dotRadius: 10
})

const emit = defineEmits<{
  connect: [source: string, target: string]
  disconnect: [source: string, target: string]
  stroke: [path: string]
  reset: []
}>()

const hasDots = computed(() => props.dots.length > 0)

const svgRef = ref<SVGSVGElement | null>(null)
const connections = ref<[string, string][]>([])
const drag = ref<DragState | null>(null)

const dotMap = computed(() => {
  const m = new Map<string, Dot>()
  for (const d of props.dots) m.set(d.id, d)
  return m
})

const strokes = ref<string[]>([])
const currentStroke = ref<string | null>(null)
const points = ref<{ x: number, y: number }[]>([])
const isDrawing = ref(false)

const connectedIds = computed(() => {
  const s = new Set<string>()
  for (const [a, b] of connections.value) {
    s.add(a)
    s.add(b)
  }
  return s
})

function toSVG(e: PointerEvent): { x: number, y: number } {
  const svg = svgRef.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const t = pt.matrixTransform(ctm.inverse())
  return { x: t.x, y: t.y }
}

function buildSmoothPath(pts: { x: number, y: number }[]): string {
  if (pts.length === 0) return ''
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  if (pts.length === 1) return `M ${first.x} ${first.y}`

  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    d += ` Q ${a.x} ${a.y} ${(a.x + b.x) / 2} ${(a.y + b.y) / 2}`
  }
  d += ` L ${last.x} ${last.y}`
  return d
}

function onDotDown(e: PointerEvent, dotId: string) {
  e.preventDefault()
  e.stopPropagation()
  const dot = dotMap.value.get(dotId)!
  drag.value = { source: dotId, x: dot.x, y: dot.y }
}

function onDotUp(dotId: string) {
  if (!drag.value || dotId === drag.value.source) {
    drag.value = null
    return
  }
  const source = drag.value.source

  const count = (id: string) =>
    connections.value.filter(([a, b]) => a === id || b === id).length
  if (count(source) >= 2 || count(dotId) >= 2) {
    drag.value = null
    return
  }

  const exists = connections.value.some(
    ([a, b]) => (a === source && b === dotId) || (a === dotId && b === source)
  )
  if (exists) {
    drag.value = null
    return
  }

  connections.value.push([source, dotId])
  emit('connect', source, dotId)
  drag.value = null
}

function onSvgDown(e: PointerEvent) {
  if (!props.freehand || hasDots) return
  isDrawing.value = true
  points.value = [toSVG(e)]
  currentStroke.value = `M ${points.value[0]!.x} ${points.value[0]!.y}`
}

function onMove(e: PointerEvent) {
  if (drag.value) {
    const pt = toSVG(e)
    drag.value.x = pt.x
    drag.value.y = pt.y
    return
  }
  if (isDrawing.value) {
    points.value.push(toSVG(e))
    currentStroke.value = buildSmoothPath(points.value)
  }
}

function onSvgUp() {
  drag.value = null
  if (isDrawing.value) {
    isDrawing.value = false
    if (currentStroke.value) {
      strokes.value.push(currentStroke.value)
      emit('stroke', currentStroke.value)
    }
    currentStroke.value = null
  }
}

function reset() {
  for (const [s, t] of connections.value) emit('disconnect', s, t)
  connections.value = []
  emit('reset')
}
</script>

<template>
  <UCard :ui="{ body: 'p-4' }">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-default">
        <UIcon name="i-lucide-pen" />
      </h3>
      <UButton
        label="Reset"
        icon="i-lucide-rotate-ccw"
        size="xs"
        variant="ghost"
        color="neutral"
        :disabled="connections.length === 0 && strokes.length === 0"
        @click="reset"
      />
    </div>

    <svg
      ref="svgRef"
      :viewBox="viewBox"
      class="w-full h-auto touch-none select-none"
      @pointerdown="onSvgDown"
      @pointermove="onMove"
      @pointerup="onSvgUp"
      @pointerleave="onSvgUp"
    >
      <g class="opacity-30 pointer-events-none">
        <slot name="background" />
      </g>

      <AnimatePresence>
        <Motion
          v-for="(d, i) in strokes"
          :key="i"
          as="path"
          :d="d"
          fill="none"
          stroke="var(--ui-primary)"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :initial="{ pathLength: 0 }"
          :animate="{ pathLength: 1 }"
          :exit="{ pathLength: 0 }"
        />
      </AnimatePresence>

      <path
        v-if="currentStroke"
        :d="currentStroke"
        fill="none"
        stroke="var(--ui-primary)"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        opacity="0.6"
      />

      <AnimatePresence>
        <Motion
          v-for="([source, target], i) in connections"
          :key="i"
          as="line"
          :x1="dotMap.get(source)!.x"
          :y1="dotMap.get(source)!.y"
          :x2="dotMap.get(target)!.x"
          :y2="dotMap.get(target)!.y"
          :stroke-width="strokeWidth"
          stroke="var(--ui-success)"
          stroke-linecap="round"
          :initial="{ pathLength: 0, opacity: 0 }"
          :animate="{ pathLength: 1, opacity: 1 }"
          :exit="{ pathLength: 0, opacity: 0 }"
          :transition="{ duration: 0.25, ease: 'easeOut' }"
        />
      </AnimatePresence>

      <line
        v-if="drag"
        :x1="dotMap.get(drag.source)!.x"
        :y1="dotMap.get(drag.source)!.y"
        :x2="drag.x"
        :y2="drag.y"
        :stroke-width="strokeWidth"
        stroke="var(--ui-primary)"
        stroke-dasharray="4 4"
        stroke-linecap="round"
        opacity="0.6"
      />

      <circle
        v-for="dot in dots"
        :key="dot.id"
        :cx="dot.x"
        :cy="dot.y"
        :r="dotRadius"
        :fill="connectedIds.has(dot.id) ? 'var(--ui-success)' : 'var(--ui-primary)'"
        class="cursor-pointer transition-colors duration-200 hover:opacity-80"
        :opacity="drag?.source === dot.id ? 0.5 : 1"
        @pointerdown="onDotDown($event, dot.id)"
        @pointerup="onDotUp(dot.id)"
      />
    </svg>
  </UCard>
</template>
