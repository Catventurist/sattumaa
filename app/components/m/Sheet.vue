<script setup lang="ts">
defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const MOVES: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  Tab: [1, 0]
}

const { t, locale } = useI18n()
const { raw, read, set, reset, clear, toCsv } = useSheet()

const grid = useTemplateRef<HTMLElement>('grid')
const active = ref('A1')
const mode = ref<'idle' | 'cell' | 'bar'>('idle')
const draft = ref('')

const ids = Array.from({ length: ROWS }, (_unused, r) => COLS.map((_col, c) => cellId(c, r)))
const current = computed(() => parseRef(active.value))
const numbers = computed(() => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 6 }))

const formula = computed({
  get: () => mode.value === 'idle' ? raw(active.value) : draft.value,
  set: (text: string) => {
    if (mode.value === 'idle') mode.value = 'bar'
    draft.value = text
  }
})

const vFocus = {
  mounted(el: HTMLInputElement) {
    nextTick(() => {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    })
  }
}

function show(id: string) {
  const value = read(id)
  return typeof value === 'number' ? numbers.value.format(value) : value
}

function isNumber(id: string) {
  return typeof read(id) === 'number'
}

function isError(id: string) {
  const value = read(id)
  return typeof value === 'string' && value.startsWith('#')
}

function cellClass(id: string) {
  return [
    isNumber(id) ? 'justify-end font-mono' : '',
    isError(id) ? 'justify-center text-error' : '',
    active.value === id ? 'z-[5] bg-info/10 ring-2 ring-info ring-inset' : ''
  ]
}

function focusGrid() {
  nextTick(() => grid.value?.focus())
}

function shift(dc: number, dr: number) {
  const { col, row } = current.value
  active.value = cellId(
    Math.min(COLS.length - 1, Math.max(0, col + dc)),
    Math.min(ROWS - 1, Math.max(0, row + dr))
  )
}

function pick(id: string) {
  mode.value = 'idle'
  active.value = id
}

function startEdit() {
  draft.value = raw(active.value)
  mode.value = 'cell'
}

function commit(dc: number, dr: number) {
  if (mode.value === 'idle') return
  set(active.value, draft.value)
  mode.value = 'idle'
  shift(dc, dr)
  focusGrid()
}

function cancel() {
  mode.value = 'idle'
  focusGrid()
}

function onBlur() {
  if (mode.value === 'cell') commit(0, 0)
}

function onKey(event: KeyboardEvent) {
  if (event.target !== event.currentTarget || mode.value !== 'idle') return
  const move = event.key === 'Tab' && event.shiftKey ? [-1, 0] : MOVES[event.key]
  if (move) {
    event.preventDefault()
    shift(move[0]!, move[1]!)
    return
  }
  if (event.key === 'Enter' || event.key === 'F2') {
    event.preventDefault()
    startEdit()
    return
  }
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    set(active.value, '')
    return
  }
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    draft.value = event.key
    mode.value = 'cell'
  }
}

function exportCsv() {
  const url = URL.createObjectURL(new Blob([toCsv()], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'sheet.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function clearAll() {
  clear()
  pick('A1')
}
</script>

<template>
  <MWindow
    :open="open"
    :title="t('sheet.title')"
    icon="i-lucide-table-2"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0 flex-col">
      <div class="flex items-center gap-2 border-b border-default p-2">
        <span class="w-10 rounded-sm bg-elevated px-1.5 py-1 text-center font-mono text-xs">
          {{ active }}
        </span>
        <form
          class="flex-1"
          @submit.prevent="commit(0, 1)"
          @keydown.esc.prevent="cancel"
        >
          <UInput
            v-model="formula"
            name="formula"
            icon="i-lucide-sigma"
            :aria-label="t('sheet.formula')"
            size="xs"
            class="w-full"
          />
        </form>
        <UButton
          icon="i-lucide-download"
          :aria-label="t('sheet.export')"
          color="neutral"
          variant="ghost"
          size="xs"
          square
          @click="exportCsv"
        />
        <UButton
          icon="i-lucide-rotate-ccw"
          :aria-label="t('sheet.reset')"
          color="neutral"
          variant="ghost"
          size="xs"
          square
          @click="reset"
        />
        <UButton
          icon="i-lucide-eraser"
          :aria-label="t('sheet.clear')"
          color="neutral"
          variant="ghost"
          size="xs"
          square
          @click="clearAll"
        />
      </div>

      <div
        ref="grid"
        tabindex="0"
        role="grid"
        :aria-label="t('sheet.title')"
        class="min-h-0 flex-1 overflow-auto outline-none"
        @keydown="onKey"
      >
        <div
          class="grid w-max min-w-full"
          :style="{ gridTemplateColumns: `2.5rem repeat(${COLS.length}, minmax(5.5rem, 1fr))` }"
        >
          <div class="sticky top-0 left-0 z-20 h-7 border-b border-e border-default bg-elevated" />
          <div
            v-for="(letter, c) in COLS"
            :key="letter"
            class="sticky top-0 z-10 flex h-7 items-center justify-center border-b border-e border-default bg-elevated text-xs"
            :class="current.col === c ? 'font-bold text-info' : 'text-muted'"
          >
            {{ letter }}
          </div>

          <template
            v-for="(rowIds, r) in ids"
            :key="r"
          >
            <div
              class="sticky left-0 z-10 flex h-7 items-center justify-center border-b border-e border-default bg-elevated text-xs"
              :class="current.row === r ? 'font-bold text-info' : 'text-muted'"
            >
              {{ r + 1 }}
            </div>
            <div
              v-for="id in rowIds"
              :key="id"
              role="gridcell"
              :aria-selected="active === id"
              class="relative flex h-7 items-center overflow-hidden border-b border-e border-default px-1.5 text-xs"
              :class="cellClass(id)"
              @click="pick(id)"
              @dblclick="startEdit"
            >
              <input
                v-if="mode === 'cell' && active === id"
                v-model="draft"
                v-focus
                :aria-label="t('sheet.cell', { id })"
                class="absolute inset-0 size-full bg-default px-1.5 font-mono text-xs outline-none"
                @keydown.enter.prevent="commit(0, 1)"
                @keydown.tab.exact.prevent="commit(1, 0)"
                @keydown.shift.tab.prevent="commit(-1, 0)"
                @keydown.esc.prevent="cancel"
                @blur="onBlur"
              >
              <span
                v-else
                class="truncate"
              >
                {{ show(id) }}
              </span>
            </div>
          </template>
        </div>
      </div>

      <p class="border-t border-default px-2 py-1 text-xs text-muted">
        {{ t('sheet.hint') }}
      </p>
    </div>
  </MWindow>
</template>
