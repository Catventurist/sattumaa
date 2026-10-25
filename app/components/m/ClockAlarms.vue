<script setup lang="ts">
const { t } = useI18n()
const { alarms, add, remove, setEnabled } = useAlarms()

const time = ref('07:00')
const label = ref('')

const sorted = computed(() => [...alarms.value].sort((a, b) => a.time.localeCompare(b.time)))

function submit() {
  if (!time.value) return
  add(time.value, label.value.trim())
  label.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <form
      class="flex items-center gap-2"
      @submit.prevent="submit"
    >
      <UInput
        v-model="time"
        name="time"
        type="time"
        :aria-label="t('clock.alarmTime')"
        class="w-32"
      />
      <UInput
        v-model="label"
        name="label"
        :placeholder="t('clock.alarmLabel')"
        class="flex-1"
      />
      <UButton
        type="submit"
        icon="i-lucide-plus"
        :aria-label="t('clock.addAlarm')"
        color="info"
        square
      />
    </form>

    <p
      v-if="!sorted.length"
      class="text-center text-muted"
    >
      {{ t('clock.noAlarms') }}
    </p>

    <ul
      v-else
      class="space-y-1"
    >
      <li
        v-for="alarm in sorted"
        :key="alarm.id"
        class="flex items-center gap-3 rounded-sm bg-elevated/50 px-3 py-2"
      >
        <span
          class="font-mono text-xl tabular-nums"
          :class="alarm.enabled ? 'text-info' : 'text-muted'"
        >
          {{ alarm.time }}
        </span>
        <span class="flex-1 truncate text-muted">{{ alarm.label }}</span>
        <USwitch
          :model-value="alarm.enabled"
          @update:model-value="setEnabled(alarm.id, $event)"
        />
        <UButton
          icon="i-lucide-trash-2"
          :aria-label="t('clock.deleteAlarm')"
          color="neutral"
          variant="ghost"
          size="xs"
          square
          @click="remove(alarm.id)"
        />
      </li>
    </ul>
  </div>
</template>
