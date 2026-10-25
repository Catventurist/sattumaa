<script setup lang="ts">
import { Reorder } from 'motion-v'

defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const { t } = useI18n()
const { order, selected, reset } = useGallery()

const index = computed(() => selected.value ? order.value.indexOf(selected.value) : -1)

function src(id: string) {
  return FS_NODES[id]?.src
}

function title(id: string) {
  const node = FS_NODES[id]
  return node ? t(node.nameKey!) : ''
}

function step(direction: number) {
  const id = order.value[index.value + direction]
  if (id) selected.value = id
}

function close() {
  selected.value = null
  emit('close')
}

const { pending, take } = useFileOpen()

function handleRequest() {
  const request = take('pictures')
  if (request && order.value.includes(request.node.id)) {
    selected.value = request.node.id
  }
}

onMounted(handleRequest)
watch(pending, handleRequest)
</script>

<template>
  <MWindow
    :open="open"
    :title="t('gallery.title')"
    icon="i-lucide-images"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="close"
  >
    <div class="relative flex h-full min-h-0 flex-col">
      <div class="flex items-center justify-between border-b border-default px-2 py-1">
        <span class="text-xs text-muted">{{ t('gallery.hint') }}</span>
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          size="xs"
          :label="t('gallery.reset')"
          @click="reset"
        />
      </div>

      <UEmpty
        v-if="!order.length"
        icon="i-lucide-image-off"
        :title="t('gallery.empty')"
        class="flex-1"
      />

      <div
        v-else
        class="min-h-0 flex-1 overflow-auto p-2"
      >
        <Reorder.Group
          v-model:values="order"
          as="div"
          axis="xy"
          class="grid grid-cols-3 gap-2"
        >
          <Reorder.Item
            v-for="id in order"
            :key="id"
            :value="id"
            as="div"
            :while-drag="{ scale: 1.05 }"
            class="relative aspect-square cursor-grab overflow-hidden rounded-md border border-default active:cursor-grabbing"
            @dblclick="selected = id"
          >
            <img
              :src="src(id)"
              :alt="title(id)"
              draggable="false"
              class="pointer-events-none size-full select-none object-cover"
            >
            <span class="absolute inset-x-0 bottom-0 truncate bg-inverted/60 px-2 py-1 text-xs text-inverted">
              {{ title(id) }}
            </span>
          </Reorder.Item>
        </Reorder.Group>
      </div>

      <div
        v-if="selected"
        class="absolute inset-0 z-10 flex flex-col bg-muted/80"
      >
        <div class="flex items-center justify-between p-2 text-inverted">
          <span class="truncate text-sm">{{ title(selected) }}</span>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="soft"
            :aria-label="t('gallery.close')"
            @click="selected = null"
          />
        </div>
        <div class="flex min-h-0 flex-1 items-center gap-2 px-2 pb-2">
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="soft"
            :disabled="index <= 0"
            :aria-label="t('gallery.previous')"
            @click="step(-1)"
          />
          <img
            :src="src(selected)"
            :alt="title(selected)"
            class="min-w-0 flex-1 object-contain"
            style="max-height: 100%"
          >
          <UButton
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="soft"
            :disabled="index >= order.length - 1"
            :aria-label="t('gallery.next')"
            @click="step(1)"
          />
        </div>
      </div>
    </div>
  </MWindow>
</template>
