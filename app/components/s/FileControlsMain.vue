<script setup lang="ts">
interface Note {
  id: number
  text: string
  done: boolean
}

const { t } = useI18n()

const notes = ref<Note[]>([
  { id: 1, text: t('localFile.sample1'), done: false },
  { id: 2, text: t('localFile.sample2'), done: true }
])

const draft = ref('')

function add() {
  const text = draft.value.trim()
  if (!text) return
  notes.value.push({ id: Date.now(), text, done: false })
  draft.value = ''
}

function remove(id: number) {
  notes.value = notes.value.filter(n => n.id !== id)
}

function parseNotes(text: string): Note[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('Invalid file')
  return data.filter(n =>
    typeof n?.id === 'number'
    && typeof n?.text === 'string'
    && typeof n?.done === 'boolean'
  )
}
</script>

<template>
  <UContainer class="py-8 space-y-4">
    <UCard>
      <template #header>
        <h1 class="font-semibold text-highlighted">
          {{ t('localFile.title') }}
        </h1>
        <p class="text-sm text-muted">
          {{ t('localFile.description') }}
        </p>
      </template>

      <div class="space-y-4">
        <SFileControls
          v-model="notes"
          :options="{ suggestedName: 'notes.json', parse: parseNotes }"
        />

        <form
          class="flex items-end gap-2"
          @submit.prevent="add"
        >
          <UFormField
            :label="t('localFile.placeholder')"
            class="flex-1"
          >
            <UInput
              v-model="draft"
              :placeholder="t('localFile.placeholder')"
              class="w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            icon="i-lucide-plus"
            :label="t('localFile.add')"
          />
        </form>

        <ul class="space-y-2">
          <li
            v-for="n in notes"
            :key="n.id"
            class="flex items-center gap-3 rounded-md px-3 py-2 ring ring-default"
          >
            <UCheckbox v-model="n.done" />
            <span
              class="flex-1"
              :class="n.done && 'line-through text-muted'"
            >{{ n.text }}</span>
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="t('localFile.remove')"
              @click="remove(n.id)"
            />
          </li>
        </ul>

        <UEmpty
          v-if="!notes.length"
          icon="i-lucide-notebook"
          :title="t('localFile.emptyTitle')"
          :description="t('localFile.emptyDescription')"
        />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-highlighted">
          {{ t('localFile.preview') }}
        </h2>
      </template>
      <pre class="overflow-x-auto text-xs text-muted">{{ JSON.stringify(notes, null, 2) }}</pre>
    </UCard>
  </UContainer>
</template>
