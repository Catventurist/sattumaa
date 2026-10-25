<script setup lang="ts">
import { defineChart } from '@tanstack/charts'
import { polar, radialBarRadius } from '@tanstack/charts/polar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'

const { t } = useI18n()

const chakras = computed(() => [
  { key: 'root', value: 8, color: '#dc2626' },
  { key: 'sacral', value: 6, color: '#ea580c' },
  { key: 'solarPlexus', value: 7, color: '#ca8a04' },
  { key: 'heart', value: 9, color: '#16a34a' },
  { key: 'throat', value: 5, color: '#2563eb' },
  { key: 'thirdEye', value: 7, color: '#4f46e5' },
  { key: 'crown', value: 4, color: '#7c3aed' }
].map(c => ({
  ...c,
  name: t(`chakra.items.${c.key}.name`),
  label: t(`chakra.items.${c.key}.label`)
})))

const chart = computed(() => defineChart({
  marks: [
    polar({
      radiusRatio: 0.8,
      scales: {
        angle: { scale: () => scaleBand<string>() },
        radius: {
          scale: scaleLinear().domain([0, Math.max(...chakras.value.map(c => c.value))]),
          range: [({ radius }) => radius * 0.15, ({ radius }) => radius]
        }
      },
      marks: [
        radialBarRadius(chakras.value, {
          id: 'chakra-bars',
          angle: 'label',
          radius: 'value',
          key: 'label',
          color: 'label',
          stroke: 'var(--ui-muted)',
          strokeWidth: 1
        })
      ]
    })
  ],
  scales: { x: null, y: null },
  color: { range: chakras.value.map(c => c.color) },
  margin: 0
}))
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-highlighted">
        {{ t('chakra.title') }}
      </h3>
      <p class="text-sm text-muted">
        {{ t('chakra.description') }}
      </p>
    </template>

    <UChart
      :definition="chart"
      :aria-label="t('chakra.ariaLabel')"
      :aria-description="t('chakra.ariaDescription')"
      :height="480"
      class="opacity-80"
    />
  </UCard>
</template>
