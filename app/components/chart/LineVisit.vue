<script setup lang="ts">
import { defineChart, lineY, ruleY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

const { t } = useI18n()

const months = ['january', 'february', 'march', 'april', 'may', 'june'] as const
const visitors = [186, 305, 237, 273, 209, 314]

const data = computed(() => months.map((month, i) => ({
  month: t(`chart.months.${month}`),
  visitors: visitors[i]!
})))

const definition = computed(() => defineChart({
  marks: [
    ruleY([250], { stroke: 'var(--ui-error)', strokeDasharray: '4 4' }),
    lineY(data.value, { x: 'month', y: 'visitors', stroke: 'var(--ui-primary)', strokeWidth: 2, points: true })
  ],
  scales: {
    x: { scale: () => scalePoint<string>().padding(0.2) },
    y: { scale: scaleLinear, nice: true, grid: true, axis: { label: t('chart.visitors') } }
  }
}))
</script>

<template>
  <UChart
    :definition="definition"
    :aria-label="t('chart.visitorsAgainstTarget')"
  />
</template>
