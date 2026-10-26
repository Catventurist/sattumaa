<script setup lang="ts">
interface Props {
  hideable?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  hide: []
}>()

const notes = defineModel<string>({ default: '' })

const { t } = useI18n()
</script>

<template>
  <div class="flex w-full flex-col gap-3 p-3">
    <div class="flex items-center justify-between">
      <p class="text-xs font-medium uppercase text-muted">
        {{ t('learning.notes') }}
      </p>
      <UButton
        v-if="hideable"
        icon="i-lucide-panel-right-close"
        color="neutral"
        variant="ghost"
        size="xs"
        :aria-label="t('learning.hideNotes')"
        @click="emit('hide')"
      />
    </div>
    <UFormField :label="t('learning.yourNotes')">
      <UTextarea
        v-model="notes"
        :rows="12"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
