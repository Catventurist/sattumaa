export interface Note {
  id: string
  body: string
  updatedAt: number
}

/* const STORAGE_KEY = 'win-notes-v1' */

export function noteTitle(body: string) {
  return body
    .split('\n')
    .map(line => line.replace(/^[#>\-*\s]+/, '').trim())
    .find(Boolean) ?? ''
}

export function useNotes() {
  const notes = useState<Note[]>('notes', () => [])
  const activeId = useState<string | null>('notes-active', () => null)
  const query = useState('notes-query', () => '')
  const ready = useState('notes-ready', () => false)

  const active = computed(() => notes.value.find(note => note.id === activeId.value) ?? null)

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return [...notes.value]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter(note => !q || note.body.toLowerCase().includes(q))
  })

  function init(seed: string) {
    if (ready.value || !import.meta.client) return
    ready.value = true
    if (!notes.value.length) {
      notes.value = [{ id: crypto.randomUUID(), body: seed, updatedAt: Date.now() }]
    }
  }
  /* function readStored(): Note[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  function init(seed: string) {
    if (ready.value || !import.meta.client) return
    ready.value = true

    const stored = readStored()
    notes.value = stored.length
      ? stored
      : [{ id: crypto.randomUUID(), body: seed, updatedAt: Date.now() }]

    let timer: ReturnType<typeof setTimeout> | undefined
    watch(notes, () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
        useState<string[]>('notes', () => [])
      }, 300)
    }, { deep: true })
  }
  */

  function create() {
    const note: Note = { id: crypto.randomUUID(), body: '', updatedAt: Date.now() }
    notes.value.push(note)
    activeId.value = note.id
    query.value = ''
  }

  function remove(id: string) {
    notes.value = notes.value.filter(note => note.id !== id)
    if (activeId.value === id) {
      activeId.value = filtered.value[0]?.id ?? null
    }
  }

  function setBody(body: string) {
    if (active.value && active.value.body !== body) {
      active.value.body = body
      active.value.updatedAt = Date.now()
    }
  }

  return { notes, activeId, active, query, filtered, init, create, remove, setBody }
}
