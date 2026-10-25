import { useLocalStorage } from '@vueuse/core'

export type ColumnId = 'todo' | 'doing' | 'done'

export const COLUMNS: ColumnId[] = ['todo', 'doing', 'done']

export interface BoardCard {
  id: string
  title?: string
  titleKey?: string
}

interface BoardState {
  cards: Record<string, BoardCard>
  columns: Record<ColumnId, string[]>
}

function createInitial(): BoardState {
  return {
    cards: {
      a: { id: 'a', titleKey: 'kanban.seedOne' },
      b: { id: 'b', titleKey: 'kanban.seedTwo' }
    },
    columns: {
      todo: ['a'],
      doing: ['b'],
      done: []
    }
  }
}

export function useBoard() {
  const state = useLocalStorage<BoardState>('win:board', createInitial(), { mergeDefaults: true })

  function detach(id: string) {
    for (const column of COLUMNS) {
      state.value.columns[column] = state.value.columns[column].filter(i => i !== id)
    }
  }

  function add(title: string) {
    const text = title.trim()
    if (!text) return
    const id = crypto.randomUUID()
    state.value.cards[id] = { id, title: text }
    state.value.columns.todo.push(id)
  }

  function move(id: string, to: ColumnId) {
    detach(id)
    state.value.columns[to].push(id)
  }

  function remove(id: string) {
    detach(id)
    state.value.cards = Object.fromEntries(
      Object.entries(state.value.cards).filter(([key]) => key !== id)
    )
  }

  function reset() {
    state.value = createInitial()
  }

  return { state, add, move, remove, reset }
}
