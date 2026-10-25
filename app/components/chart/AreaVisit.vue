<script setup lang="ts">
import type { ChartData } from '@nuxt/ui'

const { t } = useI18n()

const months = ['january', 'february', 'march', 'april', 'may', 'june'] as const

const values = [
  { desktop: 186, mobile: 80 },
  { desktop: 305, mobile: 200 },
  { desktop: 237, mobile: 120 },
  { desktop: 73, mobile: 190 },
  { desktop: 209, mobile: 130 },
  { desktop: 214, mobile: 140 }
]

const data = computed<ChartData[]>(() => months.map((month, i) => ({
  month: t(`chart.months.${month}`),
  ...values[i]!
})))

const categories = computed(() => [
  { key: 'desktop', label: t('chart.desktop') },
  { key: 'mobile', label: t('chart.mobile') }
])
</script>

<template>
  <UChart
    type="area"
    curve="step"
    :data="data"
    index="month"
    :categories="categories"
    :y-label="t('chart.visitors')"
    :aria-label="t('chart.visitorsByDevice')"
  />
</template>
