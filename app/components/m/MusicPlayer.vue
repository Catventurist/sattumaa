<script setup lang="ts">
import { useMediaControls } from '@vueuse/core'
import { AnimatePresence, Motion } from 'motion-v'

const { t } = useI18n()
const fs = useFileSystem()
const { settings } = useSettings()

const media = useTemplateRef<HTMLAudioElement>('media')
const index = ref(0)
const failed = ref(false)
const showList = ref(true)

const tracks = computed(() => Object.values(fs.nodes.value)
  .filter(n => n.kind === 'audio' && n.src && !fs.inTrash(n.id)))

const current = computed(() => tracks.value[index.value])
const src = computed(() => current.value?.src ?? '')
const title = computed(() => current.value ? fs.label(current.value) : t('music.empty'))

const { playing, currentTime, duration, volume, muted } = useMediaControls(media, {
  src: () => src.value
})

const position = computed({
  get: () => currentTime.value,
  set: (v: number) => (currentTime.value = v)
})

const seekMax = computed(() => Number.isFinite(duration.value) && duration.value > 0 ? duration.value : 1)

const repeat = computed({
  get: () => settings.value.musicRepeat,
  set: (v: boolean) => {
    settings.value.musicRepeat = v
  }
})

const volumePercent = computed({
  get: () => muted.value ? 0 : settings.value.musicVolume,
  set: (v: number) => {
    settings.value.musicVolume = v
    muted.value = false
  }
})

watch(() => settings.value.musicVolume, (v) => {
  volume.value = v / 100
}, { immediate: true })

const active = computed(() => Boolean(src.value) && (playing.value || currentTime.value > 0))

const volumeIcon = computed(() => {
  if (muted.value || settings.value.musicVolume === 0) return 'i-lucide-volume-x'
  return settings.value.musicVolume < 50 ? 'i-lucide-volume-1' : 'i-lucide-volume-2'
})

const EQ_SPEEDS = [0.9, 0.6, 1, 0.7]

function advance() {
  if (index.value < tracks.value.length - 1) select(index.value + 1)
  else if (repeat.value) select(0)
  else stop()
}

async function play() {
  await nextTick()
  if (!playing.value) playing.value = true
}

function select(i: number) {
  if (!tracks.value[i]) return
  index.value = i
  play()
}

function next() {
  if (tracks.value.length) select((index.value + 1) % tracks.value.length)
}

function previous() {
  if (tracks.value.length) select((index.value - 1 + tracks.value.length) % tracks.value.length)
}

function stop() {
  playing.value = false
  position.value = 0
}

function format(s: number) {
  if (!Number.isFinite(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

watch(src, () => {
  failed.value = false
})
</script>

<template>
  <div class="contents">
    <UPopover :content="{ side: 'top', align: 'end', sideOffset: 8, updatePositionStrategy: 'always' }">
      <UButton
        :icon="volumeIcon"
        :aria-label="t('music.volume')"
        :color="playing ? 'success' : 'primary'"
        variant="link"
        size="xs"
        square
        class="text-inverted"
      />

      <template #content>
        <Motion
          as="div"
          :initial="false"
          :animate="{ width: active ? 288 : 208 }"
          class="flex flex-col overflow-hidden p-2 font-mono text-xs select-none"
        >
          <AnimatePresence>
            <Motion
              v-if="active && showList"
              as="div"
              :initial="{ height: 0, opacity: 0 }"
              :animate="{ height: 'auto', opacity: 1 }"
              :exit="{ height: 0, opacity: 0 }"
              :transition="{ duration: 0.2 }"
              class="overflow-hidden"
            >
              <Motion
                as="ul"
                layout-scroll
                class="mb-2 max-h-32 overflow-y-auto rounded-sm border border-muted bg-elevated/40 p-1.5"
              >
                <li
                  v-for="(track, i) in tracks"
                  :key="track.id"
                >
                  <button
                    type="button"
                    class="relative flex w-full items-center gap-2 rounded-sm px-1.5 py-1 text-left hover:bg-elevated"
                    :class="i === index ? 'text-success' : 'text-muted'"
                    @click="select(i)"
                  >
                    <Motion
                      v-if="i === index"
                      as="span"
                      layout-id="music-active"
                      :transition="{ type: 'spring', stiffness: 400, damping: 35 }"
                      class="absolute inset-0 rounded-sm bg-success/10"
                    />
                    <span class="relative w-4 text-right">{{ i + 1 }}</span>
                    <span class="relative flex-1 truncate">{{ fs.label(track) }}</span>
                  </button>
                </li>
              </Motion>
            </Motion>
          </AnimatePresence>

          <AnimatePresence>
            <Motion
              v-if="active"
              as="div"
              :initial="{ height: 0, opacity: 0 }"
              :animate="{ height: 'auto', opacity: 1 }"
              :exit="{ height: 0, opacity: 0 }"
              :transition="{ duration: 0.2 }"
              class="overflow-hidden"
            >
              <div class="flex flex-col gap-2 pb-2">
                <div class="flex items-center gap-2 rounded-sm border border-accented bg-default px-2 py-1.5 text-success">
                  <div class="min-w-0 flex-1">
                    <p class="truncate">
                      {{ title }}
                    </p>
                    <div class="mt-0.5 flex justify-between text-success/70">
                      <span>{{ format(currentTime) }}</span>
                      <span>{{ format(duration) }}</span>
                    </div>
                  </div>
                  <span class="flex h-4 items-end gap-0.5">
                    <Motion
                      v-for="(speed, i) in EQ_SPEEDS"
                      :key="i"
                      as="span"
                      :initial="false"
                      :animate="playing ? { scaleY: [0.2, 1, 0.4, 0.8, 0.2] } : { scaleY: 0.2 }"
                      :transition="playing ? { duration: speed, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }"
                      class="h-full w-0.5 origin-bottom bg-success"
                    />
                  </span>
                </div>

                <USlider
                  v-model="position"
                  :max="seekMax"
                  :aria-label="t('music.seek')"
                  size="xs"
                  color="success"
                  :ui="{ track: 'rounded-none', range: 'rounded-none', thumb: 'rounded-none' }"
                />

                <div class="flex items-center justify-center gap-1">
                  <UButton
                    icon="i-lucide-skip-back"
                    :aria-label="t('music.previous')"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    @click="previous"
                  />
                  <UButton
                    :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'"
                    :aria-label="playing ? t('music.pause') : t('music.play')"
                    color="success"
                    variant="soft"
                    size="sm"
                    square
                    @click="playing = !playing"
                  />
                  <UButton
                    icon="i-lucide-square"
                    :aria-label="t('music.stop')"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    @click="stop"
                  />
                  <UButton
                    icon="i-lucide-skip-forward"
                    :aria-label="t('music.next')"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    @click="next"
                  />
                  <UButton
                    icon="i-lucide-repeat"
                    :aria-label="t('music.repeat')"
                    :aria-pressed="repeat"
                    :color="repeat ? 'success' : 'neutral'"
                    :variant="repeat ? 'soft' : 'ghost'"
                    size="sm"
                    square
                    @click="repeat = !repeat"
                  />
                </div>
              </div>
            </Motion>
          </AnimatePresence>

          <div class="flex items-center gap-2">
            <UButton
              :icon="volumeIcon"
              :aria-label="t('music.mute')"
              color="neutral"
              variant="ghost"
              size="xs"
              square
              @click="muted = !muted"
            />
            <USlider
              v-model="volumePercent"
              :aria-label="t('music.volume')"
              size="xs"
              color="success"
              class="flex-1"
              :ui="{ track: 'rounded-none', range: 'rounded-none', thumb: 'rounded-none' }"
            />
            <UButton
              v-if="!active && tracks.length"
              icon="i-lucide-play"
              :aria-label="t('music.play')"
              color="success"
              variant="soft"
              size="xs"
              square
              @click="select(index)"
            />
            <UButton
              v-if="active"
              icon="i-lucide-list-music"
              :aria-label="t('music.playlist')"
              :color="showList ? 'success' : 'neutral'"
              variant="ghost"
              size="xs"
              square
              @click="showList = !showList"
            />
          </div>

          <UAlert
            v-if="failed"
            class="mt-2"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            :title="t('music.failed')"
          />
        </Motion>
      </template>
    </UPopover>

    <audio
      ref="media"
      @ended="advance"
      @error="failed = true"
    />
  </div>
</template>
