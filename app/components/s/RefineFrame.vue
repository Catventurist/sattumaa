<script setup lang="ts">
import type { CSSProperties } from 'vue'

export type RefineFrameStatus = 'queued' | 'generating' | 'refining' | 'complete' | 'error'

interface RefineFrameProps {
  status?: RefineFrameStatus
  aspectRatio?: string
  width?: number
  radius?: number
  stageDuration?: number
  sweep?: boolean
  showStatus?: boolean
  hideAfter?: number
  labels?: Partial<Record<RefineFrameStatus, string>>
  retryLabel?: string
}

interface Stage {
  blur: number
  sat: number
  scale: number
  opacity: number
}

interface Sim {
  p: number
  raf: number
  last: number
  key: string
  w: number
  h: number
  levels: HTMLCanvasElement[]
  glint: CanvasGradient | null
  sent: boolean
}

const STAGES: Record<RefineFrameStatus, Stage> = {
  queued: { blur: 4, sat: 0.6, scale: 1.04, opacity: 0.55 },
  generating: { blur: 1.5, sat: 0.8, scale: 1.02, opacity: 0.85 },
  refining: { blur: 0.5, sat: 0.95, scale: 1.005, opacity: 1 },
  complete: { blur: 0, sat: 1, scale: 1, opacity: 1 },
  error: { blur: 2, sat: 0.5, scale: 1, opacity: 0.28 }
}
const TARGET: Partial<Record<RefineFrameStatus, number>> = { queued: 0, generating: 0.5, refining: 0.875, complete: 1 }
const LEVELS = [48, 32, 20, 12, 8, 5, 3, 2, 1]
const EDGE = 28
const STRIPS = 14
const ACTIVE = new Set<string>(['queued', 'generating', 'refining'])
const GLINT_STOPS = [
  [0, 0],
  [0.08, 0.1],
  [0.2, 0.7],
  [0.32, 1],
  [0.68, 1],
  [0.8, 0.7],
  [0.92, 0.1],
  [1, 0]
]

function build(s: Sim, canvas: HTMLCanvasElement, img: HTMLImageElement, dpr: number) {
  const rect = canvas.getBoundingClientRect()
  const W = Math.max(1, Math.round(rect.width * dpr))
  const H = Math.max(1, Math.round(rect.height * dpr))
  const key = `${img.currentSrc}|${W}x${H}`
  if (s.key === key) return
  s.key = key
  s.w = W
  s.h = H
  canvas.width = W
  canvas.height = H
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const cover = Math.max(W / iw, H / ih)
  const sw = W / cover
  const sh = H / cover
  const sx = (iw - sw) / 2
  const sy = (ih - sh) / 2
  const glint = canvas.getContext('2d')?.createLinearGradient(0, 0, W, 0) ?? null
  if (glint) {
    for (const [at, a] of GLINT_STOPS) {
      glint.addColorStop(at!, `rgba(255, 255, 255, ${a})`)
    }
  }
  s.glint = glint
  s.levels = LEVELS.map((block) => {
    const b = block === 1 ? 1 : Math.max(2, Math.round(block * dpr))
    const full = document.createElement('canvas')
    full.width = W
    full.height = H
    const fc = full.getContext('2d')
    if (!fc) return full
    if (b === 1) {
      fc.imageSmoothingEnabled = true
      fc.imageSmoothingQuality = 'high'
      fc.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
      return full
    }
    const small = document.createElement('canvas')
    small.width = Math.max(1, Math.round(W / b))
    small.height = Math.max(1, Math.round(H / b))
    const sc = small.getContext('2d')
    if (sc) {
      sc.imageSmoothingEnabled = true
      sc.imageSmoothingQuality = 'high'
      sc.drawImage(img, sx, sy, sw, sh, 0, 0, small.width, small.height)
    }
    fc.imageSmoothingEnabled = false
    fc.drawImage(small, 0, 0, W, H)
    return full
  })
}

const props = withDefaults(defineProps<RefineFrameProps>(), {
  status: 'generating',
  aspectRatio: '4 / 3',
  width: 320,
  radius: 16,
  stageDuration: 400,
  sweep: true,
  showStatus: true,
  hideAfter: 1200,
  labels: undefined,
  retryLabel: undefined
})

const emit = defineEmits<{
  retry: []
}>()

const { t } = useI18n()
const instance = getCurrentInstance()

const stage = computed(() => STAGES[props.status] ?? STAGES.generating)
const active = computed(() => ACTIVE.has(props.status))
const retryText = computed(() => props.retryLabel ?? t('refineFrame.retry'))
const text = computed<Record<RefineFrameStatus, string>>(() => ({
  queued: t('refineFrame.queued'),
  generating: t('refineFrame.generating'),
  refining: t('refineFrame.refining'),
  complete: t('refineFrame.complete'),
  error: t('refineFrame.error'),
  ...props.labels
}))
const retryable = computed(() => props.status === 'error' && !!instance?.vnode.props?.onRetry)

const printRef = useTemplateRef<HTMLDivElement>('printRef')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const sim: Sim = { p: 0, raf: 0, last: 0, key: '', w: 0, h: 0, levels: [], glint: null, sent: false }
let reduce = false
const mosaic = ref(false)
const resolved = ref(false)

const chip = ref(props.showStatus)
let chipTimer: ReturnType<typeof setTimeout> | undefined

function syncChip() {
  clearTimeout(chipTimer)
  if (!props.showStatus) {
    chip.value = false
    return
  }
  chip.value = true
  if (props.status === 'complete' && props.hideAfter > 0) {
    chipTimer = setTimeout(() => {
      chip.value = false
    }, props.hideAfter)
  }
}
watch(() => [props.status, props.showStatus, props.hideAfter], syncChip)

function tick(now: number) {
  const s = sim
  const canvas = canvasRef.value
  const img = printRef.value?.querySelector('img') as HTMLImageElement | null
  if (!canvas || !img || !img.naturalWidth) {
    s.raf = 0
    return
  }
  const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0.016)
  s.last = now
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  build(s, canvas, img, dpr)
  const n = s.levels.length - 1
  const target = TARGET[props.status] ?? s.p
  const rate = reduce ? 1e9 : 1 / (n * (props.stageDuration / 1000))
  const step = rate * dt
  if (target < s.p) s.p = target
  else if (target - s.p <= step) s.p = target
  else s.p += step
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const L = s.p * n
    const i = Math.min(n, Math.floor(L + 1e-6))
    const frac = L - i
    ctx.globalAlpha = 1
    ctx.drawImage(s.levels[i]!, 0, 0)
    if (i < n && frac > 0) {
      const edge = EDGE * dpr
      const front = frac * (s.h + edge) - edge / 2
      const top = Math.max(0, Math.floor(front - edge / 2))
      if (top > 0) ctx.drawImage(s.levels[i + 1]!, 0, 0, s.w, top, 0, 0, s.w, top)
      const sh = edge / STRIPS
      for (let k = 0; k < STRIPS; k += 1) {
        const y = front - edge / 2 + k * sh
        if (y + sh <= 0 || y >= s.h) continue
        const u = 1 - (k + 0.5) / STRIPS
        ctx.globalAlpha = u * u * (3 - 2 * u)
        const y0 = Math.max(0, y)
        const h0 = Math.min(s.h, y + sh) - y0
        if (h0 > 0) ctx.drawImage(s.levels[i + 1]!, 0, y0, s.w, h0, 0, y0, s.w, h0)
      }
      ctx.globalAlpha = 1
      if (props.sweep && !reduce && s.glint && front > 0 && front < s.h) {
        ctx.fillStyle = s.glint
        ctx.globalAlpha = 0.12
        ctx.fillRect(0, front - 2 * dpr, s.w, 4 * dpr)
        ctx.globalAlpha = 0.3
        ctx.fillRect(0, front - dpr, s.w, 2 * dpr)
        ctx.globalAlpha = 1
      }
    }
  }
  const done = s.p >= 1
  if (done !== s.sent) {
    s.sent = done
    resolved.value = done
  }
  const keep = (!reduce && ACTIVE.has(props.status)) || Math.abs(target - s.p) > 0.0005
  s.raf = keep ? requestAnimationFrame(tick) : 0
  if (!keep) s.last = 0
}

function wake() {
  if (!sim.raf) sim.raf = requestAnimationFrame(tick)
}

let unbindImage: (() => void) | null = null

function bindImage() {
  unbindImage?.()
  unbindImage = null
  const img = printRef.value?.querySelector('img') as HTMLImageElement | null
  if (!img) {
    mosaic.value = false
    return
  }
  let gone = false
  const start = () => {
    if (gone) return
    mosaic.value = true
    wake()
  }
  if (img.complete && img.naturalWidth) start()
  else img.addEventListener('load', start, { once: true })
  unbindImage = () => {
    gone = true
    img.removeEventListener('load', start)
  }
}

let mq: MediaQueryList | null = null

function syncReduce() {
  reduce = !!mq?.matches
}

onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncReduce()
  mq.addEventListener('change', syncReduce)
  syncChip()
  bindImage()
  wake()
})
onUpdated(bindImage)
watch(() => props.status, bindImage, { flush: 'post' })
watch(() => [props.status, props.width, props.aspectRatio], wake, { flush: 'post' })
onUnmounted(() => {
  cancelAnimationFrame(sim.raf)
  clearTimeout(chipTimer)
  unbindImage?.()
  mq?.removeEventListener('change', syncReduce)
})

const rootStyle = computed<CSSProperties>(() => ({
  '--ui-w': `${props.width}px`,
  '--ui-aspect': props.aspectRatio,
  '--ui-radius': `${props.radius}px`,
  '--ui-stage': `${props.stageDuration}ms`,
  '--ui-blur': `${mosaic.value ? 0 : stage.value.blur}px`,
  '--ui-sat': stage.value.sat,
  '--ui-scale': mosaic.value ? 1 : stage.value.scale,
  '--ui-opacity': stage.value.opacity
}))
</script>

<template>
  <div
    class="group isolate relative overflow-hidden bg-primary/20 text-default font-medium text-xs leading-none w-[min(var(--ui-w),100%)] aspect-(--ui-aspect) rounded-(--ui-radius)"
    role="img"
    :aria-label="text[status] ?? status"
    :aria-busy="active || undefined"
    :data-status="status"
    :data-active="active ? '' : undefined"
    :data-sweep="sweep && active ? '' : undefined"
    :data-mosaic="mosaic ? '' : undefined"
    :data-resolved="mosaic && resolved ? '' : undefined"
    :style="rootStyle"
  >
    <div
      class="absolute inset-0 group-data-[status=queued]:animate-[refine-frame-wait_2.4s_ease-in-out_infinite] motion-reduce:animate-none! opacity-(--ui-opacity) filter-[blur(var(--ui-blur))_saturate(var(--ui-sat))] transform-[scale(var(--ui-scale))] [transition:opacity_var(--ui-stage)_cubic-bezier(0.23,1,0.32,1),filter_var(--ui-stage)_cubic-bezier(0.23,1,0.32,1),transform_var(--ui-stage)_cubic-bezier(0.23,1,0.32,1)] motion-reduce:[transition:opacity_var(--ui-stage)_ease]"
      aria-hidden="true"
    >
      <div
        ref="printRef"
        class="size-full *:block *:size-full *:object-cover group-data-mosaic:opacity-0 group-data-resolved:opacity-100! [transition:opacity_var(--ui-stage)_ease]"
      >
        <slot />
      </div>
      <canvas
        ref="canvasRef"
        class="absolute inset-0 size-full opacity-0 pointer-events-none group-data-mosaic:opacity-100 group-data-resolved:opacity-0! [transition:opacity_var(--ui-stage)_ease]"
      />
    </div>
    <div
      class="absolute inset-0 opacity-0 pointer-events-none group-data-mosaic:opacity-0 group-data-sweep:opacity-100 motion-reduce:group-data-sweep:opacity-0 group-data-mosaic:animate-none! group-data-sweep:animate-[refine-frame-sweep_2.2s_linear_infinite] motion-reduce:group-data-sweep:animate-none [background:linear-gradient(115deg,transparent_38%,color-mix(in_srgb,var(--ui-text)_14%,transparent)_50%,transparent_62%)] bg-size-[260%_100%] [transition:opacity_var(--ui-stage)_ease]"
      aria-hidden="true"
    />
    <div
      v-if="chip"
      class="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 h-6.5 pr-2.5 pl-2 rounded-full bg-default/70 backdrop-blur-sm pointer-events-none opacity-100 starting:opacity-0 translate-y-0 starting:translate-y-1 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-opacity"
      aria-hidden="true"
    >
      <UIcon
        v-if="status === 'complete'"
        name="i-lucide-check"
        class="size-3.5 text-success"
      />
      <UIcon
        v-else-if="status === 'error'"
        name="i-lucide-triangle-alert"
        class="size-3.5 text-error"
      />
      <UIcon
        v-else
        name="i-lucide-loader-circle"
        class="size-3.5 text-default/80 animate-spin motion-reduce:animate-none"
      />
      <span
        :key="status"
        class="animate-[refine-frame-label_200ms_ease_both]"
      >
        {{ text[status] ?? status }}
      </span>
    </div>
    <UButton
      v-if="retryable"
      class="absolute top-1/2 left-1/2 -translate-1/2 starting:opacity-0 starting:scale-95 transition-[opacity,scale] duration-200"
      color="neutral"
      variant="soft"
      size="sm"
      icon="i-lucide-refresh-cw"
      :label="retryText"
      @click="emit('retry')"
    />
    <span
      class="sr-only"
      role="status"
    >{{ text[status] ?? status }}</span>
  </div>
</template>

<style>
@keyframes refine-frame-sweep {
  from {
    background-position: 130% 0;
  }
  to {
    background-position: -130% 0;
  }
}

@keyframes refine-frame-label {
  from {
    opacity: 0;
    filter: blur(2px);
  }
}

@keyframes refine-frame-wait {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.65;
  }
}
</style>
