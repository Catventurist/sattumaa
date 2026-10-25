<script setup lang="ts">
const { t, n } = useI18n()

const months = ['january', 'february', 'march', 'april', 'may', 'june'] as const

const scores = [
  { freedom: 72, bureaucracy: 48 },
  { freedom: 65, bureaucracy: 58 },
  { freedom: 54, bureaucracy: 63 },
  { freedom: 61, bureaucracy: 50 },
  { freedom: 47, bureaucracy: 66 },
  { freedom: 70, bureaucracy: 44 }
]

const data = computed(() => months.map((month, i) => ({
  month: t(`chart.months.${month}`),
  ...scores[i]!
})))

const categories = computed(() => [
  { key: 'freedom' as const, label: t('chart.freedom'), color: 'success' as const },
  { key: 'bureaucracy' as const, label: t('chart.bureaucracy'), color: 'error' as const }
])

function balance(month?: string) {
  const row = data.value.find(row => row.month === month)

  return row ? row.freedom - row.bureaucracy : 0
}
</script>

<template>
  <UChart
    type="bar"
    :data="data"
    index="month"
    :categories="categories"
    :format="value => n(value)"
    :aria-label="t('chart.freedomVsBureaucracy')"
  >
    <template #tooltip="{ title, rows }">
      <p class="font-medium text-highlighted">
        {{ title }}
      </p>

      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-center gap-2"
      >
        <span
          class="size-2 rounded-full"
          :style="{ backgroundColor: row.color }"
        />
        <span class="text-muted">{{ row.label }}</span>
        <span class="ms-auto ps-4 tabular-nums">{{ row.value }}</span>
      </div>

      <USeparator class="my-1" />

      <div class="flex items-center gap-2">
        <span class="text-muted">{{ t('chart.balance') }}</span>
        <UBadge
          :color="balance(title) >= 0 ? 'success' : 'error'"
          :label="n(balance(title), { signDisplay: 'exceptZero' })"
          variant="subtle"
          size="sm"
          class="ms-auto tabular-nums"
        />
      </div>
    </template>
  </UChart>
</template>
