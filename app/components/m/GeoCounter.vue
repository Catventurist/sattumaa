<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{
  id: string
  base: number
}>()

const { t } = useI18n()
const visits = useLocalStorage<Record<string, number>>('win:geo:visits', {}, { initOnMounted: true })

onMounted(() => {
  visits.value = { ...visits.value, [props.id]: (visits.value[props.id] ?? 0) + 1 }
})

const digits = computed(() => String(props.base + (visits.value[props.id] ?? 0)).padStart(6, '0').split(''))
</script>

<template>
  <div class="flex items-center gap-2 text-sm">
    <span>{{ t('geo.visitors') }}</span>
    <span class="flex gap-0.5 font-mono">
      <span
        v-for="(digit, i) in digits"
        :key="i"
        class="rounded-sm border border-accented bg-elevated px-1 text-success tabular-nums"
      >
        {{ digit }}
      </span>
    </span>
  </div>
</template>
