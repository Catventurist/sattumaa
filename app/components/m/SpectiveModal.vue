<script lang="ts" setup>
interface Note {
  id: string
  text?: string
  textKey?: string
  votes: number
  mine: boolean
  done?: boolean
}

interface Column {
  id: 'good' | 'bad' | 'actions'
  icon: string
  tone: string
  notes: Note[]
}

const props = withDefaults(
  defineProps<{
    title?: string
    maxVotes?: number
    initial?: Column[]
  }>(),
  {
    title: undefined,
    maxVotes: 3,
    initial: () => [
      {
        id: 'good',
        icon: 'i-lucide-smile',
        tone: 'bg-success/20 border-success/40',
        notes: [
          { id: 'n1', textKey: 'spective.notes.pairing', votes: 4, mine: false },
          { id: 'n2', textKey: 'spective.notes.demos', votes: 2, mine: false }
        ]
      },
      {
        id: 'bad',
        icon: 'i-lucide-frown',
        tone: 'bg-warning/20 border-warning/40',
        notes: [
          { id: 'n3', textKey: 'spective.notes.requests', votes: 5, mine: false },
          { id: 'n4', textKey: 'spective.notes.staging', votes: 1, mine: false }
        ]
      },
      {
        id: 'actions',
        icon: 'i-lucide-list-checks',
        tone: 'bg-info/20 border-info/40',
        notes: [
          { id: 'n5', textKey: 'spective.notes.intake', votes: 0, mine: false, done: false },
          { id: 'n6', textKey: 'spective.notes.healthCheck', votes: 0, mine: false, done: true }
        ]
      }
    ]
  }
)

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()

const label = (note: Note) => (note.textKey ? t(note.textKey) : note.text ?? '')

const columns = ref<Column[]>(
  props.initial.map(column => ({ ...column, notes: column.notes.map(note => ({ ...note })) }))
)
const drafts = reactive<Record<string, string>>({})
let counter = 100

const used = computed(
  () => columns.value.flatMap(column => column.notes).filter(note => note.mine).length
)
const votesLeft = computed(() => props.maxVotes - used.value)

const sorted = (column: Column) => [...column.notes].sort((a, b) => b.votes - a.votes)

function vote(note: Note) {
  if (note.mine) {
    note.mine = false
    note.votes--
  } else if (votesLeft.value > 0) {
    note.mine = true
    note.votes++
  } else {
    toast.add({ title: t('spective.outOfVotes'), color: 'info' })
  }
}

function resetVotes() {
  columns.value
    .flatMap(column => column.notes)
    .forEach((note) => {
      if (note.mine) {
        note.mine = false
        note.votes--
      }
    })
}

function add(column: Column) {
  const text = drafts[column.id]?.trim()
  if (!text) return
  column.notes.push({
    id: `n${counter++}`,
    text,
    votes: 0,
    mine: false,
    done: column.id === 'actions' ? false : undefined
  })
  drafts[column.id] = ''
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.title ?? t('spective.title')"
    :ui="{ content: 'max-w-6xl', body: 'max-h-[70vh] overflow-y-auto' }"
  >
    <UButton
      :label="t('spective.open')"
      icon="i-lucide-messages-square"
      color="neutral"
      variant="outline"
    />

    <template #description>
      <span aria-live="polite">{{ t('spective.votesLeft', votesLeft) }}</span>
    </template>

    <template #actions>
      <UButton
        :label="t('spective.resetVotes')"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="outline"
        size="sm"
        :disabled="votesLeft === maxVotes"
        @click="resetVotes"
      />
    </template>

    <template #body>
      <div class="grid gap-4 md:grid-cols-3">
        <section
          v-for="column in columns"
          :key="column.id"
          class="rounded-xl border p-3"
          :class="column.tone"
          :aria-label="t(`spective.columns.${column.id}`)"
        >
          <h2 class="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
            <UIcon
              :name="column.icon"
              class="size-4"
            />
            {{ t(`spective.columns.${column.id}`) }}
          </h2>

          <ul class="space-y-2">
            <AnimatePresence>
              <Motion
                v-for="note in sorted(column)"
                :key="note.id"
                as="li"
                layout
                :initial="{ opacity: 0, y: 8 }"
                :animate="{ opacity: 1, y: 0 }"
                :exit="{ opacity: 0, scale: 0.95 }"
                :transition="{ duration: 0.2 }"
                class="flex items-start gap-2 rounded-lg border border-default bg-default p-3 text-sm shadow-xs"
              >
                <UCheckbox
                  v-if="column.id === 'actions'"
                  v-model="note.done"
                  class="mt-0.5"
                  :aria-label="t('spective.markDone', { text: label(note) })"
                />
                <p
                  class="flex-1"
                  :class="note.done ? 'text-muted line-through' : ''"
                >
                  {{ label(note) }}
                </p>
                <UButton
                  icon="i-lucide-thumbs-up"
                  :label="String(note.votes)"
                  size="xs"
                  :color="note.mine ? 'primary' : 'neutral'"
                  :variant="note.mine ? 'soft' : 'outline'"
                  class="shrink-0 rounded-full"
                  :aria-pressed="note.mine"
                  :aria-label="t(note.mine ? 'spective.unvote' : 'spective.vote', { text: label(note) })"
                  @click="vote(note)"
                />
              </Motion>
            </AnimatePresence>
          </ul>

          <form
            class="mt-3"
            @submit.prevent="add(column)"
          >
            <UInput
              v-model="drafts[column.id]"
              :placeholder="t('spective.addNote')"
              :aria-label="t('spective.addNoteTo', { column: t(`spective.columns.${column.id}`) })"
              autocomplete="off"
              class="w-full"
            />
          </form>
        </section>
      </div>
    </template>
  </UModal>
</template>
