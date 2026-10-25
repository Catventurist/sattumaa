<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
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
const { state, add, move, remove, reset } = useBoard()

const draft = ref('')

const tones: Record<ColumnId, string> = {
  todo: 'bg-inverted/5',
  doing: 'bg-info/10',
  done: 'bg-success/10'
}

function submit() {
  add(draft.value)
  draft.value = ''
}

function label(id: string) {
  const card = state.value.cards[id]
  if (!card) return ''
  return card.titleKey ? t(card.titleKey) : (card.title ?? '')
}

function menu(id: string, from: ColumnId): DropdownMenuItem[] {
  return COLUMNS.filter(c => c !== from).map(c => ({
    label: t('kanban.moveTo', { column: t(`kanban.${c}`) }),
    icon: 'i-lucide-arrow-right',
    onSelect: () => move(id, c)
  }))
}
</script>

<template>
  <MWindow
    :open="open"
    :title="t('kanban.title')"
    icon="i-lucide-kanban"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-4xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0 flex-col">
      <div class="flex items-center gap-2 border-b border-default p-2">
        <UInput
          v-model="draft"
          name="draft"
          :placeholder="t('kanban.placeholder')"
          class="flex-1"
          @keydown.enter="submit"
        />
        <UButton
          icon="i-lucide-plus"
          :label="t('kanban.add')"
          @click="submit"
        />
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          :aria-label="t('kanban.reset')"
          @click="reset"
        />
      </div>

      <div class="grid min-h-0 flex-1 grid-cols-3 gap-2 p-2">
        <section
          v-for="column in COLUMNS"
          :key="column"
          class="flex min-h-0 flex-col rounded-md border border-default"
          :class="tones[column]"
        >
          <header class="flex items-center justify-between px-2 py-1">
            <span class="text-sm font-medium">{{ t(`kanban.${column}`) }}</span>
            <UBadge
              color="neutral"
              variant="subtle"
              :label="state.columns[column].length"
            />
          </header>

          <div class="min-h-0 flex-1 overflow-auto p-2">
            <p
              v-if="!state.columns[column].length"
              class="text-xs text-muted"
            >
              {{ t('kanban.empty') }}
            </p>
            <Reorder.Group
              v-model:values="state.columns[column]"
              as="div"
              axis="y"
              class="space-y-2"
              :aria-label="t(`kanban.${column}`)"
            >
              <Reorder.Item
                v-for="id in state.columns[column]"
                :key="id"
                :value="id"
                as="div"
                :transition="REORDER_SPRING"
                :while-drag="{ scale: 1.03 }"
                class="relative flex cursor-grab touch-none select-none items-start gap-1 rounded-md border border-default bg-default p-2 active:cursor-grabbing"
              >
                <span class="min-w-0 flex-1 wrap-break-word text-sm">{{ label(id) }}</span>
                <UDropdownMenu :items="menu(id, column)">
                  <UButton
                    icon="i-lucide-ellipsis"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :aria-label="t('kanban.move')"
                  />
                </UDropdownMenu>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  :aria-label="t('kanban.delete')"
                  @click="remove(id)"
                />
              </Reorder.Item>
            </Reorder.Group>
          </div>
        </section>
      </div>
    </div>
  </MWindow>
</template>
