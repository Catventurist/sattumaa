<script setup lang="ts">
import { Motion } from 'motion-v'
import { geoNeighbor, geoUrl, type GeoSite } from '~/composables/useWin'

const props = defineProps<{
  site: GeoSite
}>()

const emit = defineEmits<{
  navigate: [url: string]
}>()

const { t } = useI18n()

const TONES = {
  info: { text: 'text-info', box: 'border-info bg-info/10 text-info' },
  success: { text: 'text-success', box: 'border-success bg-success/10 text-success' },
  warning: { text: 'text-warning', box: 'border-warning bg-warning/10 text-warning' },
  error: { text: 'text-error', box: 'border-error bg-error/10 text-error' },
  secondary: { text: 'text-secondary', box: 'border-secondary bg-secondary/10 text-secondary' }
} as const

const tone = computed(() => TONES[props.site.color])
const likes = [1, 2, 3]
const badges = ['notepad', 'netscape', 'anyBrowser']

function text(name: string) {
  return t(`geo.sites.${props.site.id}.${name}`)
}

function visit(site: GeoSite) {
  emit('navigate', geoUrl(site.path))
}
</script>

<template>
  <div class="flex min-h-full flex-col gap-4 bg-default p-4">
    <div
      class="flex justify-center border border-warning py-1 bg-[repeating-linear-gradient(45deg,var(--ui-warning)_0_12px,var(--ui-bg-muted)_12px_24px)]"
    >
      <span class="flex animate-blink items-center gap-2 bg-default px-2 text-xs font-bold uppercase motion-reduce:animate-none">
        <UIcon
          name="i-lucide-construction"
          class="size-4 text-warning"
        />
        {{ t('geo.construction') }}
      </span>
    </div>

    <h1
      class="text-center text-3xl font-bold"
      :class="tone.text"
    >
      {{ text('title') }}
    </h1>

    <UMarquee
      :overlay="false"
      :repeat="2"
      class="border-y border-default py-1 text-lg"
    >
      <span class="px-6">{{ text('marquee') }}</span>
    </UMarquee>

    <Motion
      as="div"
      :initial="{ filter: 'blur(16px)', opacity: 0.4 }"
      :animate="{ filter: 'blur(0px)', opacity: 1 }"
      :transition="{ duration: 1.4 }"
      class="flex h-28 items-center justify-center rounded-sm border-2"
      :class="tone.box"
    >
      <UIcon
        :name="site.icon"
        class="size-16 animate-spin motion-reduce:animate-none"
        style="animation-duration: 6s"
      />
    </Motion>

    <p>{{ text('welcome') }}</p>

    <ul class="space-y-1">
      <li
        v-for="n in likes"
        :key="n"
        class="flex items-center gap-2"
      >
        <UIcon
          name="i-lucide-star"
          class="size-4 animate-blink text-warning motion-reduce:animate-none"
        />
        {{ text(`like${n}`) }}
      </li>
    </ul>

    <div class="flex flex-wrap gap-2">
      <UButton
        icon="i-lucide-book-open"
        :label="t('geo.guestbook.open')"
        color="info"
        variant="soft"
        @click="emit('navigate', geoUrl(`${site.path}/guestbook.html`))"
      />
      <UButton
        icon="i-lucide-home"
        :label="t('geo.back')"
        color="neutral"
        variant="outline"
        @click="emit('navigate', geoUrl())"
      />
    </div>

    <MGeoCounter
      :id="site.id"
      :base="site.visits"
    />

    <div class="rounded-sm border border-default p-2 text-center text-sm">
      <p class="mb-1 font-bold">
        {{ t('geo.webring.title') }}
      </p>
      <div class="flex justify-center gap-2">
        <UButton
          icon="i-lucide-chevron-left"
          :label="t('geo.webring.previous')"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="visit(geoNeighbor(site, -1))"
        />
        <UButton
          trailing-icon="i-lucide-chevron-right"
          :label="t('geo.webring.next')"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="visit(geoNeighbor(site, 1))"
        />
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-1">
      <span
        v-for="badge in badges"
        :key="badge"
        class="flex h-8 w-22 items-center justify-center border border-accented bg-elevated px-1 text-center text-[9px] leading-tight"
      >
        {{ t(`geo.badges.${badge}`) }}
      </span>
    </div>
  </div>
</template>
