<script setup lang="ts">
import { animate, useMotionValue, useTransform, RowValue } from 'motion-v'

const { t } = useI18n()

const data = [
  { browser: 'Chrome', visitors: 2 },
  { browser: 'Safari', visitors: 2 },
  { browser: 'Firefox', visitors: 3 },
  { browser: 'Brave', visitors: 1 }
]

const total = computed(() => data.reduce((sum, item) => sum + item.visitors, 0))

const count = useMotionValue(0)
const rounded = useTransform(() => Math.round(count.get()))

let controls: ReturnType<typeof animate> | undefined

watch(total, (value) => {
  controls?.stop()
  controls = animate(count, value, { duration: 2 })
}, { immediate: true })

onUnmounted(() => controls?.stop())
</script>

<template>
  <UChart
    type="donut"
    :data="data"
    index="browser"
    :categories="['visitors']"
    legend
    :aria-label="t('chart.visitorsByBrowser')"
  >
    <template #center>
      <span class="text-4xl font-semibold text-primary leading-none">
        <RowValue :value="rounded" />
      </span>
      <span class="text-xs text-muted">{{ t('chart.visitors') }}</span>
    </template>
  </UChart>
</template>
