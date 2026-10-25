<script setup lang="ts">
import type { PinSlotsStatus } from '~/components/s/PinSlots.vue'

const { t } = useI18n()
const toast = useToast()
const status = ref<PinSlotsStatus>('idle')

async function verify(code: string) {
  await new Promise(resolve => setTimeout(resolve, 600))
  return code === '123456'
}

async function handleComplete(code: string) {
  const ok = await verify(code).catch(() => false)
  status.value = ok ? 'success' : 'error'
  toast.add({
    title: ok ? t('pinSlots.successTitle') : t('pinSlots.errorTitle'),
    description: ok ? t('pinSlots.successBody') : t('pinSlots.errorBody'),
    icon: ok ? 'i-lucide-circle-check' : 'i-lucide-circle-alert',
    color: ok ? 'success' : 'error'
  })
}
</script>

<template>
  <SPinSlots
    :length="6"
    :status="status"
    :slot-size="44"
    :gap="8"
    :radius="12"
    :bounce="0.2"
    :settle="0.3"
    :rise="8"
    :cascade="20"
    @change="status = 'idle'"
    @complete="handleComplete"
  />
</template>
