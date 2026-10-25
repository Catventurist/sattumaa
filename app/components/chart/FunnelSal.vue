<script setup lang="ts">
import { areaX, defineChart } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

interface FunnelPoint {
  id: string
  boundary: 'top' | 'bottom'
  y: number
  x1: number
  x2: number
  label: string
  value: number
}

const { t, locale } = useI18n()

const stageValues = [
  { id: 'visitors', value: 12400 },
  { id: 'leads', value: 6200 },
  { id: 'qualified', value: 3100 },
  { id: 'proposals', value: 1400 },
  { id: 'customers', value: 620 }
]

const colors = [900, 800, 700, 600, 500].map(s => `var(--ui-color-primary-${s})`)

const first = stageValues[0]!.value

const stages = computed(() => stageValues.map(s => ({
  ...s,
  label: t(`funnel.stages.${s.id}`)
})))

const layout = computed(() => {
  const list = stages.value
  const half = (v: number) => (v / first) / 2

  const points: FunnelPoint[] = list.flatMap((s, i) => {
    const next = list[i + 1]?.value ?? s.value * 0.8
    return [
      { id: s.id, boundary: 'top', y: i, x1: -half(s.value), x2: half(s.value), label: s.label, value: s.value },
      { id: s.id, boundary: 'bottom', y: i + 1, x1: -half(next), x2: half(next), label: s.label, value: s.value }
    ]
  })

  const labels = list.map((s, i) => ({
    id: s.id,
    x: 0,
    y: i + 0.5,
    text: `${s.label} · ${s.value.toLocaleString(locale.value)}`
  }))

  return { points, labels }
})

const chart = computed(() => defineChart({
  marks: [
    areaX(layout.value.points, {
      id: 'funnel-stages',
      x1: 'x1',
      x2: 'x2',
      y: 'y',
      z: 'id',
      color: 'id',
      key: p => `${p.id}:${p.boundary}`,
      fillOpacity: 1
    })
    /* text(layout.value.labels, {
      id: 'funnel-labels',
      x: 'x',
      y: 'y',
      text: 'text',
      key: 'id',
      anchor: 'middle',
      fontSize: 12,
      fontWeight: 600,
      fill: 'white'
    }) */
  ],
  scales: {
    x: { scale: scaleLinear().domain([-0.5, 0.5]), axis: false },
    y: { scale: scaleLinear().domain([stages.value.length, 0]), axis: false }
  },
  color: { domain: stages.value.map(s => s.id), range: colors },
  margin: 12,
  keyboard: true,
  tooltip: {
    use: tooltip,
    format: ({ datum }) => {
      if (!('value' in datum)) return ''
      return `${datum.label} · ${datum.value.toLocaleString(locale.value)} · ${
        Math.round((datum.value / first) * 100)
      }% ${t('funnel.ofVisitors')}`
    }
  }
}))
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-highlighted">
        {{ t('funnel.title') }}
      </h3>
      <p class="text-sm text-muted">
        {{ t('funnel.description') }}
      </p>
    </template>

    <UChart
      :definition="chart"
      :aria-label="t('funnel.ariaLabel')"
      :height="480"
    />
  </UCard>
</template>
