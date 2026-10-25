<script setup lang="ts">
import { useMediaControls } from '@vueuse/core'

const props = defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

defineEmits<{
  minimize: []
  close: []
}>()

const { t } = useI18n()
const fs = useFileSystem()
const { queue, index, current, hasNext, hasPrevious, load, select, next, previous, playSrc } = usePlayer()
const { pending, take } = useFileOpen()

const media = useTemplateRef<HTMLMediaElement>('media')
const failed = ref(false)
const showList = ref(true)

function seed() {
  if (queue.value.length) return
  const tracks = Object.values(fs.nodes.value)
    .filter(n => (n.kind === 'audio' || n.kind === 'video') && n.src && !fs.inTrash(n.id))
    .map(n => ({ id: n.id, src: n.src!, title: fs.label(n) }))
  load(tracks)
}

seed()

const src = computed(() => current.value?.src ?? '')
const kind = computed(() => mediaKind(src.value))

const { playing, currentTime, duration, volume, muted, rate } = useMediaControls(media, {
  src: () => src.value
})

const position = computed({
  get: () => currentTime.value,
  set: (v: number) => (currentTime.value = v)
})

const speeds = [0.5, 1, 1.5, 2]

const speedItems = computed(() => speeds.map(s => ({
  label: `${s}x`,
  icon: rate.value === s ? 'i-lucide-check' : undefined,
  onSelect: () => (rate.value = s)
})))

async function play() {
  await nextTick()
  if (!playing.value) playing.value = true
}

function titleOf(node: FsNode) {
  return node.nameKey ? t(node.nameKey) : (node.name ?? node.id)
}

function handleRequest() {
  const target = take('media')?.node
  if (!target?.src) return
  const changed = playSrc({ id: target.id, src: target.src, title: titleOf(target) })
  if (!changed) play()
}

watch(() => props.open, (value) => {
  if (!value) playing.value = false
})

watch(src, (value) => {
  failed.value = false
  if (value) play()
})

watch(pending, handleRequest, { flush: 'post' })
onMounted(handleRequest)

function onEnded() {
  if (hasNext.value) next()
  else playing.value = false
}

function format(s: number) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
</script>

<template>
  <MWindow
    :open="open"
    :title="current?.title ?? t('player.title')"
    icon="i-lucide-film"
    :constraints="constraints"
    size-class="h-[28rem] w-full max-w-3xl"
    @minimize="$emit('minimize')"
    @close="$emit('close')"
  >
    <div class="flex h-full min-h-0">
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex min-h-0 flex-1 items-center justify-center bg-inverted/5">
          <UEmpty
            v-if="!src"
            icon="i-lucide-clapperboard"
            :title="t('player.empty')"
          />
          <UAlert
            v-else-if="failed"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :title="t('player.error')"
            class="m-4"
          />
          <video
            v-else-if="kind === 'video'"
            ref="media"
            class="size-full bg-inverted"
            @error="failed = true"
            @ended="onEnded"
          />
          <template v-else>
            <audio
              ref="media"
              @error="failed = true"
              @ended="onEnded"
            />
            <UIcon
              name="i-lucide-music"
              class="size-16 text-muted"
            />
          </template>
        </div>

        <div class="flex items-center gap-1 border-t border-default p-2">
          <UButton
            icon="i-lucide-skip-back"
            color="neutral"
            variant="ghost"
            :disabled="!hasPrevious"
            :aria-label="t('player.previous')"
            @click="previous"
          />
          <UButton
            :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'"
            color="neutral"
            variant="ghost"
            :disabled="!src || failed"
            :aria-label="playing ? t('player.pause') : t('player.play')"
            @click="playing = !playing"
          />
          <UButton
            icon="i-lucide-skip-forward"
            color="neutral"
            variant="ghost"
            :disabled="!hasNext"
            :aria-label="t('player.next')"
            @click="next"
          />
          <span class="w-10 text-center text-xs tabular-nums">{{ format(currentTime) }}</span>
          <USlider
            v-model="position"
            :max="duration || 1"
            :step="1"
            class="flex-1"
          />
          <span class="w-10 text-center text-xs tabular-nums">{{ format(duration) }}</span>
          <UDropdownMenu :items="speedItems">
            <UButton
              :label="`${rate}x`"
              color="neutral"
              variant="ghost"
              :aria-label="t('player.speed')"
            />
          </UDropdownMenu>
          <UButton
            :icon="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            color="neutral"
            variant="ghost"
            :aria-label="t('player.mute')"
            @click="muted = !muted"
          />
          <USlider
            v-model="volume"
            :min="0"
            :max="1"
            :step="0.05"
            class="w-20"
          />
          <UButton
            icon="i-lucide-list-music"
            color="neutral"
            :variant="showList ? 'soft' : 'ghost'"
            :aria-label="t('player.playlist')"
            @click="showList = !showList"
          />
        </div>
      </div>

      <aside
        v-if="showList"
        class="w-52 shrink-0 overflow-auto border-l border-default"
      >
        <p class="px-2 py-1 text-xs font-medium text-muted">
          {{ t('player.playlist') }}
        </p>
        <p
          v-if="!queue.length"
          class="px-2 text-xs text-muted"
        >
          {{ t('player.queueEmpty') }}
        </p>
        <UButton
          v-for="(track, i) in queue"
          :key="track.id"
          :label="track.title"
          :icon="i === index ? 'i-lucide-play' : 'i-lucide-music'"
          color="neutral"
          variant="ghost"
          class="w-full justify-start rounded-none"
          :class="i === index && 'bg-info/10'"
          @click="select(i)"
        />
      </aside>
    </div>
  </MWindow>
</template>
