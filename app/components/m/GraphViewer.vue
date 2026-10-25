<script setup lang="ts">
import { motion } from 'motion-v'
import { onKeyStroke } from '@vueuse/core'

interface Lane { id: string, label: string, x: number, y: number, w: number, h: number }
interface Node { id: string, label: string, lane: string, x: number, y: number, w: number, h: number }
interface Edge { id: string, from: string, to: string, path: string }
interface Doc {
  lanes: Lane[]
  nodes: Node[]
  edges: Edge[]
  walkthrough?: { steps: { focus: string[] }[] }
}
interface Box { x: number, y: number, w: number, h: number }

const props = defineProps<{ doc: Doc }>()

const HOME: Box = { x: 0, y: 0, w: 900, h: 360 }

const step = ref(-1)
const focused = computed(() => {
  const s = props.doc.walkthrough?.steps?.[step.value]
  return s ? new Set(s.focus) : null
})

const vb = ref<Box>({ ...HOME })
const svgRef = ref<SVGSVGElement | null>(null)
let dragging = false
let last: [number, number] = [0, 0]
let raf = 0

function onWheel(e: WheelEvent) {
  cancelAnimationFrame(raf)
  const ctm = svgRef.value?.getScreenCTM()
  if (!ctm) return
  const k = 1.005 ** e.deltaY
  const mx = (e.clientX - ctm.e) / ctm.a
  const my = (e.clientY - ctm.f) / ctm.d
  vb.value = {
    x: mx - (mx - vb.value.x) * k,
    y: my - (my - vb.value.y) * k,
    w: vb.value.w * k,
    h: vb.value.h * k
  }
}

function onPointerDown(e: PointerEvent) {
  cancelAnimationFrame(raf)
  dragging = true
  last = [e.clientX, e.clientY]
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  const ctm = svgRef.value?.getScreenCTM()
  if (!dragging || !ctm) return
  vb.value = {
    ...vb.value,
    x: vb.value.x - (e.clientX - last[0]) / ctm.a,
    y: vb.value.y - (e.clientY - last[1]) / ctm.d
  }
  last = [e.clientX, e.clientY]
}

function onPointerUp(e: PointerEvent) {
  dragging = false
  ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
}

function fit(box: Box): Box {
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect?.width || !rect.height) return box
  const ratio = rect.width / rect.height
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const w = Math.max(box.w, box.h * ratio)
  const h = w / ratio
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}

function animateViewBox(target: Box) {
  cancelAnimationFrame(raf)
  const start = { ...vb.value }
  const t0 = performance.now()
  const dur = 350
  function tick(now: number) {
    const t = Math.min((now - t0) / dur, 1)
    const ease = 1 - (1 - t) ** 3
    vb.value = {
      x: start.x + (target.x - start.x) * ease,
      y: start.y + (target.y - start.y) * ease,
      w: start.w + (target.w - start.w) * ease,
      h: start.h + (target.h - start.h) * ease
    }
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function reset() {
  step.value = -1
  animateViewBox(fit(HOME))
}

function nextStep() {
  const steps = props.doc.walkthrough?.steps
  if (!steps?.length) return

  const next = step.value + 1
  if (next >= steps.length) {
    reset()
    return
  }
  step.value = next

  const s = steps[next]
  if (!s?.focus) return
  const nodes = props.doc.nodes.filter(n => s.focus.includes(n.id))
  if (!nodes.length) return

  const x = Math.min(...nodes.map(n => n.x)) - 40
  const y = Math.min(...nodes.map(n => n.y)) - 40
  const w = Math.max(...nodes.map(n => n.x + n.w)) + 40 - x
  const h = Math.max(...nodes.map(n => n.y + n.h)) + 40 - y
  animateViewBox(fit({ x, y, w, h }))
}

onKeyStroke('w', nextStep)
onKeyStroke('r', reset)
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="relative h-[calc(100dvh-var(--ui-header-height)-2rem)] max-h-160 min-h-0 rounded-xl overflow-hidden bg-default/60">
    <svg
      ref="svgRef"
      :viewBox="`${vb.x} ${vb.y} ${vb.w} ${vb.h}`"
      class="block size-full cursor-grab active:cursor-grabbing outline-none [-webkit-tap-highlight-color:transparent]"
      preserveAspectRatio="xMidYMid meet"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <motion.g
        v-for="lane in doc.lanes"
        :key="lane.id"
        :data-id="lane.id"
        :animate="{ opacity: focused && !focused.has(lane.id) ? 0.15 : 1 }"
        :transition="{ duration: 0.3 }"
        class="outline-none"
      >
        <rect
          :x="lane.x"
          :y="lane.y"
          :width="lane.w"
          :height="lane.h"
          rx="8"
          class="fill-(--ui-bg-muted) outline-none"
        />
        <text
          :x="lane.x + 12"
          :y="lane.y + 20"
          class="fill-primary text-sm font-semibold"
        >
          {{ lane.label }}
        </text>
      </motion.g>

      <motion.g
        v-for="n in doc.nodes"
        :key="n.id"
        :data-id="n.id"
        :animate="{ opacity: focused && !focused.has(n.id) ? 0.15 : 1 }"
        :transition="{ duration: 0.3 }"
        class="fill-(--ui-primary)/20  hover:fill-(--ui-info)/20 outline-none"
      >
        <rect
          :x="n.x"
          :y="n.y"
          :width="n.w"
          :height="n.h"
          rx="4"
          class="outline-none"
        />
        <text
          :x="n.x + n.w / 2"
          :y="n.y + n.h / 2 + 5"
          text-anchor="middle"
          class="fill-secondary text-sm font-semibold"
        >
          {{ n.label }}
        </text>
      </motion.g>

      <motion.path
        v-for="e in doc.edges"
        :key="e.id"
        :d="e.path"
        :data-id="e.id"
        :animate="{ opacity: focused && !focused.has(e.id) ? 0.15 : 1 }"
        :transition="{ duration: 0.3 }"
        class="fill-none stroke-info"
      />
    </svg>

    <UFieldGroup
      class="absolute top-4 right-2 gap-2 flex items-center"
      size="sm"
    >
      <span
        v-if="step >= 0"
        class="text-center text-muted tabular-nums"
      >
        {{ step + 1 }}/{{ doc.walkthrough!.steps.length }}
      </span>
      <UButton
        icon="i-lucide-play"
        size="lg"
        :disabled="!doc.walkthrough"
        @click="nextStep"
      />
      <UButton
        icon="i-lucide-rotate-ccw"
        size="lg"
        @click="reset"
      />
    </UFieldGroup>
  </div>
</template>
