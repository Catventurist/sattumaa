<script setup lang="ts" generic="T">
import type { LocalFileOptions } from '~/composables/useLocalFile'

const props = defineProps<{
  options?: LocalFileOptions<T>
}>()

const model = defineModel<T>({ required: true })

const { t } = useI18n()
const toast = useToast()
const file = useLocalFile<T>(props.options)

async function onOpen() {
  try {
    const data = await file.open()
    if (data === null) return
    model.value = data
    toast.add({ title: t('localFile.opened', { name: file.name.value ?? '' }), color: 'success' })
  } catch {
    toast.add({ title: t('localFile.error'), color: 'error' })
  }
}

async function onSave() {
  try {
    if (await file.save(model.value)) {
      toast.add({ title: t('localFile.saved'), icon: 'i-lucide-check', color: 'success' })
    }
  } catch {
    toast.add({ title: t('localFile.error'), color: 'error' })
  }
}

async function onSaveAs() {
  try {
    if (await file.saveAs(model.value)) {
      toast.add({ title: t('localFile.saved'), icon: 'i-lucide-check', color: 'success' })
    }
  } catch {
    toast.add({ title: t('localFile.error'), color: 'error' })
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UButton
      icon="i-lucide-folder-open"
      color="neutral"
      variant="outline"
      :label="t('localFile.open')"
      @click="onOpen"
    />
    <UButton
      icon="i-lucide-save"
      :label="t('localFile.save')"
      @click="onSave"
    />
    <UButton
      v-if="file.native.value"
      icon="i-lucide-save-all"
      color="neutral"
      variant="ghost"
      :label="t('localFile.saveAs')"
      @click="onSaveAs"
    />
    <UBadge
      v-if="file.name.value"
      color="neutral"
      variant="subtle"
      :label="file.name.value"
    />
  </div>
</template>
