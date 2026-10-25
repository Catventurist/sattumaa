<script setup lang="ts">
import { defineChart } from '@tanstack/charts'
import { angleGrid, polar, radialArea, radialGrid } from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { curveLinearClosed } from 'd3-shape'

type FeelingKey = 'joy' | 'calm' | 'love' | 'energy' | 'hope' | 'sadness' | 'anger' | 'anxiety'
type Values = Record<FeelingKey, number>
interface Entry { date: string, values: Values }

const { t, locale } = useI18n()
const toast = useToast()

const keys: FeelingKey[] = ['joy', 'calm', 'love', 'energy', 'hope', 'sadness', 'anger', 'anxiety']
const max = 10

const today = () => new Date().toISOString().slice(0, 10)
const defaults = (): Values => Object.fromEntries(keys.map(k => [k, 5])) as Values

const values = reactive<Values>(defaults())
const entries = useState<Entry[]>('mood-entries', () => [])
/* const storageKey = 'mood-entries' */
/* const entries = ref<Entry[]>([]) */

const emoji: Record<FeelingKey, string> = {
  joy: '😸',
  calm: '😺',
  love: '😻',
  energy: '😼',
  hope: '😽',
  sadness: '😿',
  anger: '😾',
  anxiety: '🙀'
}

const name = (k: FeelingKey) => t(`feelings.items.${k}`)

onMounted(() => {
  const existing = entries.value.find(e => e.date === today())
  if (existing) Object.assign(values, existing.values)
})

function save() {
  const entry: Entry = { date: today(), values: { ...values } }
  const next = entries.value.filter(e => e.date !== entry.date)
  next.push(entry)
  next.sort((a, b) => a.date.localeCompare(b.date))
  entries.value = next.slice(-30)
  toast.add({ title: t('mood.saved'), icon: 'i-lucide-check', color: 'success' })
}
/* onMounted(() => {
  try {
    entries.value = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  } catch {
    entries.value = []
  }
  const existing = entries.value.find(e => e.date === today())
  if (existing) Object.assign(values, existing.values)
})

function save() {
  const entry: Entry = { date: today(), values: { ...values } }
  const next = entries.value.filter(e => e.date !== entry.date)
  next.push(entry)
  next.sort((a, b) => a.date.localeCompare(b.date))
  entries.value = next.slice(-30)
  localStorage.setItem(storageKey, JSON.stringify(entries.value))
  toast.add({ title: t('mood.saved'), icon: 'i-lucide-check', color: 'success' })
}
*/

function reset() {
  Object.assign(values, defaults())
}

const rows = computed(() => keys.map(k => ({
  feeling: name(k),
  value: values[k]
})))

const radar = computed(() => defineChart({
  marks: [
    polar({
      radiusRatio: 0.76,
      scales: {
        angle: { scale: scalePoint<string>().domain(rows.value.map(r => r.feeling)), wrap: true },
        radius: { scale: scaleLinear().domain([0, max]) }
      },
      guides: [
        radialGrid({
          values: [2.5, 5, 7.5, 10],
          shape: 'polygon',
          stroke: 'var(--ui-border)',
          strokeOpacity: 1
        }),
        angleGrid({
          values: rows.value.map(r => r.feeling),
          labels: true,
          labelOffset: 10,
          labelFill: 'var(--ui-muted)',
          labelFontSize: 12,
          stroke: 'var(--ui-default)',
          strokeOpacity: 1
        })
      ],
      marks: [
        radialArea(rows.value, {
          id: 'mood-radar',
          angle: 'feeling',
          radius: 'value',
          key: 'feeling',
          z: () => 'mood',
          curve: curveLinearClosed,
          fill: 'var(--ui-primary)',
          fillOpacity: 0.5,
          stroke: 'var(--ui-secondary)',
          strokeWidth: 1.5
        })
      ]
    })
  ],
  scales: { x: null, y: null },
  margin: 0
}))

const history = computed(() => entries.value.slice(-7).map(e => ({
  date: new Date(e.date).toLocaleDateString(locale.value, { month: 'short', day: 'numeric' }),
  ...e.values
})))

const categories = computed(() => keys.map(k => ({ key: k, label: name(k) })))
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <UCard>
      <template #header>
        <h3 class="font-semibold text-highlighted">
          {{ t('mood.title') }}
        </h3>
        <p class="text-sm text-muted">
          {{ t('mood.description') }}
        </p>
      </template>

      <div
        v-for="k in keys"
        :key="k"
        class="space-y-1"
      >
        <span class="block font-medium text-default">{{ name(k) }}</span>
        <div class="flex items-center gap-3">
          <span
            class="text-xl leading-none"
            aria-hidden="true"
          >{{ emoji[k] }}</span>
          <USlider
            v-model="values[k]"
            :aria-label="name(k)"
            :min="0"
            :max="max"
            :step="1"
            :tooltip="{ text: `${emoji[k]} ${values[k]}` }"
            class="flex-1"
          />
          <span class="w-6 text-right text-sm tabular-nums text-muted">{{ values[k] }}</span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            :label="t('mood.reset')"
            @click="reset"
          />
          <UButton
            icon="i-lucide-save"
            :label="t('mood.save')"
            @click="save"
          />
        </div>
      </template>
    </UCard>

    <div class="space-y-4">
      <UCard>
        <UChart
          :definition="radar"
          :aria-label="t('feelings.ariaLabel')"
          :height="300"
        />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-highlighted">
            {{ t('mood.history') }}
          </h3>
        </template>

        <UChart
          v-if="history.length > 1"
          type="line"
          curve="monotone"
          :data="history"
          index="date"
          :categories="categories"
          :height="240"
          :aria-label="t('mood.historyAria')"
        />
        <UEmpty
          v-else
          icon="i-lucide-chart-line"
          :title="t('mood.emptyTitle')"
          :description="t('mood.emptyDescription')"
        />
      </UCard>
    </div>
  </div>
</template>
