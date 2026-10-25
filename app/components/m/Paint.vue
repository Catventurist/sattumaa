<script setup lang="ts">
defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const { t } = useI18n()
const toast = useToast()
const fs = useFileSystem()
const gallery = useGallery()
const { launch } = useWin()
const { pending, take } = useFileOpen()

const WIDTH = 480
const HEIGHT = 320
const PALETTE = ['neutral', 'inverted', 'info', 'success', 'warning', 'error', 'secondary']

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const tool = ref<'brush' | 'eraser'>('brush')
const size = ref(4)
const color = ref('info')
const drawing = ref(false)
const history = shallowRef<ImageData[]>([])

let pos = { x: 0, y: 0 }

function context() {
  return canvas.value?.getContext('2d', { willReadFrequently: true }) ?? null
}

function resolve(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--ui-color-${token}`).trim()
}

function paper() {
  const c = context()
  if (!c) return
  c.fillStyle = resolve('neutral-50')
  c.fillRect(0, 0, WIDTH, HEIGHT)
}

function snapshot() {
  const c = context()
  if (!c) return
  history.value = [...history.value.slice(-19), c.getImageData(0, 0, WIDTH, HEIGHT)]
}

function undo() {
  const c = context()
  const previous = history.value.at(-1)
  if (!c || !previous) return
  c.putImageData(previous, 0, 0)
  history.value = history.value.slice(0, -1)
}

function clear() {
  snapshot()
  paper()
}

function point(event: PointerEvent) {
  const rect = canvas.value!.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (WIDTH / rect.width),
    y: (event.clientY - rect.top) * (HEIGHT / rect.height)
  }
}

function stroke(from: { x: number, y: number }, to: { x: number, y: number }) {
  const c = context()
  if (!c) return
  const erasing = tool.value === 'eraser'
  c.strokeStyle = resolve(erasing ? 'neutral-50' : color.value)
  c.lineWidth = erasing ? size.value * 3 : size.value
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.beginPath()
  c.moveTo(from.x, from.y)
  c.lineTo(to.x, to.y)
  c.stroke()
}

function start(event: PointerEvent) {
  snapshot()
  drawing.value = true
  pos = point(event)
  canvas.value?.setPointerCapture(event.pointerId)
  stroke(pos, pos)
}

function move(event: PointerEvent) {
  if (!drawing.value) return
  const next = point(event)
  stroke(pos, next)
  pos = next
}

function end() {
  drawing.value = false
}

function pick(id: string) {
  color.value = id
  tool.value = 'brush'
}

function encode() {
  return canvas.value?.toDataURL('image/webp', 0.85) ?? ''
}

function save() {
  const src = encode()
  if (!src.startsWith('data:image/webp')) {
    toast.add({ title: t('paint.noWebp'), color: 'error' })
    return
  }
  const now = new Date()
  const name = `${t('paint.file')} ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.webp`
  const id = fs.create('pictures', 'image', { name, src })
  toast.add({
    title: t('paint.saved'),
    description: name,
    icon: 'i-lucide-check',
    color: 'success',
    actions: [{
      label: t('paint.openGallery'),
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        gallery.selected.value = id
        launch('pictures')
      }
    }]
  })
}

function download() {
  const link = document.createElement('a')
  link.href = encode()
  link.download = 'drawing.webp'
  link.click()
}

function handleRequest() {
  const src = take('paint')?.node.src
  const c = context()
  if (!src || !c) return
  const image = new Image()
  image.onload = () => {
    snapshot()
    paper()
    const scale = Math.min(WIDTH / image.width, HEIGHT / image.height)
    const w = image.width * scale
    const h = image.height * scale
    c.drawImage(image, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h)
  }
  image.src = src
}

onMounted(() => {
  paper()
  handleRequest()
})

watch(pending, handleRequest, { flush: 'post' })
</script>

<template>
  <MWindow
    :open="open"
    :title="t('paint.title')"
    icon="i-lucide-paintbrush"
    :constraints="constraints"
    size-class="h-[28rem] w-full max-w-xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0 flex-col gap-2 p-2">
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          icon="i-lucide-pencil"
          :aria-label="t('paint.brush')"
          :color="tool === 'brush' ? 'info' : 'neutral'"
          :variant="tool === 'brush' ? 'soft' : 'ghost'"
          size="xs"
          square
          @click="tool = 'brush'"
        />
        <UButton
          icon="i-lucide-eraser"
          :aria-label="t('paint.eraser')"
          :color="tool === 'eraser' ? 'info' : 'neutral'"
          :variant="tool === 'eraser' ? 'soft' : 'ghost'"
          size="xs"
          square
          @click="tool = 'eraser'"
        />
        <USlider
          v-model="size"
          :min="1"
          :max="24"
          :aria-label="t('paint.size')"
          size="xs"
          color="info"
          class="w-24"
        />
        <div class="flex items-center gap-1">
          <button
            v-for="id in PALETTE"
            :key="id"
            type="button"
            :aria-label="id"
            :aria-pressed="color === id && tool === 'brush'"
            class="size-5 rounded-sm border-2 border-muted ring-offset-1 ring-offset-default ring-primary"
            :class="color === id && tool === 'brush' && 'ring-2 ring-inverted'"
            :style="{ backgroundColor: `var(--ui-color-${id})` }"
            @click="pick(id)"
          />
        </div>
        <div class="ml-auto flex items-center gap-1">
          <UButton
            icon="i-lucide-undo-2"
            :aria-label="t('paint.undo')"
            :disabled="!history.length"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            @click="undo"
          />
          <UButton
            icon="i-lucide-trash-2"
            :aria-label="t('paint.clear')"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            @click="clear"
          />
        </div>
      </div>

      <div class="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-sm bg-elevated/40 p-2">
        <canvas
          ref="canvas"
          :width="WIDTH"
          :height="HEIGHT"
          class="max-h-full max-w-full cursor-crosshair touch-none rounded-sm border border-default"
          @pointerdown="start"
          @pointermove="move"
          @pointerup="end"
          @pointercancel="end"
        />
      </div>

      <div class="flex items-center justify-end gap-2">
        <UButton
          icon="i-lucide-download"
          :label="t('paint.download')"
          color="neutral"
          variant="outline"
          size="sm"
          @click="download"
        />
        <UButton
          icon="i-lucide-save"
          :label="t('paint.save')"
          color="info"
          size="sm"
          @click="save"
        />
      </div>
    </div>
  </MWindow>
</template>
