<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { CalendarDate } from '@internationalized/date'
import { getLocalTimeZone, today } from '@internationalized/date'
import { useNow } from '@vueuse/core'

defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const { t, locale } = useI18n()
const { settings } = useSettings()
const now = useNow({ interval: 1000 })

const tab = ref('clock')
const selected = shallowRef<CalendarDate | null>(today(getLocalTimeZone()))

const tabs = computed<TabsItem[]>(() => [
  { label: t('clock.tabClock'), icon: 'i-lucide-clock', value: 'clock' },
  { label: t('clock.tabCalendar'), icon: 'i-lucide-calendar', value: 'calendar' },
  { label: t('clock.tabStopwatch'), icon: 'i-lucide-timer', value: 'stopwatch' },
  { label: t('clock.tabTimer'), icon: 'i-lucide-hourglass', value: 'timer' },
  { label: t('clock.tabAlarms'), icon: 'i-lucide-alarm-clock', value: 'alarms' }
])

const zones = [
  { id: 'helsinki', zone: 'Europe/Helsinki' },
  { id: 'london', zone: 'Europe/London' },
  { id: 'newYork', zone: 'America/New_York' },
  { id: 'tokyo', zone: 'Asia/Tokyo' }
]

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

function timeIn(zone: string, seconds = false) {
  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined,
    hour12: !settings.value.clock24h,
    timeZone: zone
  }).format(now.value)
}

const date = computed(() => new Intl.DateTimeFormat(locale.value, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(now.value))
</script>

<template>
  <MWindow
    :open="open"
    :title="t('clock.title')"
    icon="i-lucide-clock"
    :constraints="constraints"
    size-class="h-[28rem] w-full max-w-xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0 flex-col">
      <UTabs
        v-model="tab"
        :items="tabs"
        :content="false"
        class="border-b border-default p-2"
      />

      <div class="min-h-0 flex-1 overflow-auto">
        <div
          v-show="tab === 'clock'"
          class="flex flex-col items-center gap-4 p-4"
        >
          <p class="font-mono text-5xl text-info tabular-nums">
            {{ timeIn(localZone, true) }}
          </p>
          <p class="text-muted">
            {{ date }}
          </p>
          <USeparator :label="t('clock.world')" />
          <ul class="w-full space-y-1">
            <li
              v-for="entry in zones"
              :key="entry.id"
              class="flex items-center justify-between rounded-sm bg-elevated/50 px-3 py-1.5"
            >
              <span>{{ t(`clock.zone.${entry.id}`) }}</span>
              <span class="font-mono tabular-nums">{{ timeIn(entry.zone) }}</span>
            </li>
          </ul>
        </div>

        <div
          v-show="tab === 'calendar'"
          class="flex justify-center p-4"
        >
          <UCalendar
            v-model="selected"
            :locale="locale"
            :week-starts-on="1"
            week-numbers
            size="lg"
            color="info"
          />
        </div>

        <MClockStopwatch v-show="tab === 'stopwatch'" />
        <MClockTimer v-show="tab === 'timer'" />
        <MClockAlarms v-show="tab === 'alarms'" />
      </div>
    </div>
  </MWindow>
</template>
