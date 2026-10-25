<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

defineProps<{ constraints?: HTMLElement | null }>()

const open = defineModel<boolean>('open', { default: true })

const { t, locale } = useI18n()
const { activeId, active, query, filtered, init, create, remove, setBody } = useNotes()

const body = computed({
  get: () => active.value?.body ?? '',
  set: value => setBody(value ?? '')
})

const toolbarItems = computed<EditorToolbarItem[][]>(() => [
  [
    { kind: 'undo', icon: 'i-lucide-undo' },
    { kind: 'redo', icon: 'i-lucide-redo' }
  ],
  [
    {
      icon: 'i-lucide-heading',
      content: { align: 'start' },
      items: [1, 2, 3].map(level => ({
        kind: 'heading' as const,
        level,
        icon: `i-lucide-heading-${level}`,
        label: t('notes.heading', { n: level })
      }))
    },
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: t('notes.bullet') } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: t('notes.ordered') } },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: t('notes.quote') } }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline' },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code' }
  ]
])

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => init(t('notes.welcome')))
const emit = defineEmits<{ minimize: [], close: [] }>()
</script>

<template>
  <MWindow
    v-model:open="open"
    :title="t('notes.title')"
    icon="i-lucide-notebook-pen"
    :constraints="constraints"
    size-class="h-[28rem] w-full max-w-4xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex min-h-0 flex-1">
      <aside class="flex w-48 shrink-0 flex-col border-e border-default bg-elevated/30">
        <div class="flex items-center gap-1 p-1.5">
          <UInput
            v-model="query"
            name="query"
            size="sm"
            class="flex-1"
            icon="i-lucide-search"
            :placeholder="t('notes.search')"
          />
          <UButton
            icon="i-lucide-plus"
            size="sm"
            square
            color="info"
            :aria-label="t('notes.new')"
            @click="create"
          />
        </div>

        <ul
          v-if="filtered.length"
          class="flex-1 space-y-0.5 overflow-y-auto p-1"
        >
          <li
            v-for="note in filtered"
            :key="note.id"
          >
            <UButton
              block
              color="neutral"
              :variant="note.id === activeId ? 'soft' : 'ghost'"
              class="h-auto flex-col items-start"
              @click="activeId = note.id"
            >
              <span class="w-full truncate text-start text-sm font-medium">
                {{ noteTitle(note.body) || t('notes.untitled') }}
              </span>
              <span class="text-xs text-muted">{{ formatDate(note.updatedAt) }}</span>
            </UButton>
          </li>
        </ul>

        <UEmpty
          v-else
          class="flex-1"
          icon="i-lucide-notebook"
          :title="t('notes.emptyTitle')"
          :description="t('notes.emptyDescription')"
        />
      </aside>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <template v-if="active">
          <UEditor
            v-slot="{ editor }"
            :key="active.id"
            v-model="body"
            content-type="markdown"
            :placeholder="t('notes.placeholder')"
            :ui="{ base: 'p-4' }"
            class="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            <UEditorToolbar
              :editor="editor"
              :items="toolbarItems"
              class="sticky top-0 z-10 overflow-x-auto border-b border-default bg-default/90 px-2 py-1 backdrop-blur"
            />
          </UEditor>

          <div class="flex items-center justify-between border-t border-default px-3 py-1 text-xs text-muted">
            <span>{{ t('notes.chars', { n: active.body.length }) }}</span>
            <UButton
              icon="i-lucide-trash-2"
              size="xs"
              color="error"
              variant="ghost"
              :label="t('notes.delete')"
              @click="remove(active.id)"
            />
          </div>
        </template>

        <UEmpty
          v-else
          class="flex-1"
          icon="i-lucide-notebook-pen"
          :title="t('notes.emptyTitle')"
          :description="t('notes.emptyDescription')"
          :actions="[{ label: t('notes.new'), icon: 'i-lucide-plus', onClick: create }]"
        />
      </div>
    </div>
  </MWindow>
</template>
