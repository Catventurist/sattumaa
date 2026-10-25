import { useLocalStorage } from '@vueuse/core'

export interface LedgerEntry {
  serial: string
  value: number
  merchant: string
  at: string
}

export type ReconcileStatus = 'credited' | 'double-spend' | 'expired' | 'invalid'

export interface ReconcileResult {
  serial: string
  value: number
  status: ReconcileStatus
}

export interface StoredNote {
  iv: string
  ciphertext: string
  expiresAt: string
}

export const NOTE_DAYS = 7

export function useKioskServer() {
  const ledger = useLocalStorage<Record<string, LedgerEntry>>('win:kiosk:ledger', {}, { initOnMounted: true })
  const { verify } = useKiosk()

  const balances = computed(() => {
    const totals: Record<string, number> = {}
    for (const entry of Object.values(ledger.value)) {
      totals[entry.merchant] = (totals[entry.merchant] ?? 0) + entry.value
    }
    return totals
  })

  async function submit(merchant: string, tokens: string[]) {
    const results: ReconcileResult[] = []
    for (const token of tokens) {
      const checked = await verify(token)
      if (!checked.ok) {
        results.push({ serial: '-', value: 0, status: checked.reason === 'expired' ? 'expired' : 'invalid' })
      } else if (ledger.value[checked.serial]) {
        results.push({ serial: checked.serial, value: checked.value, status: 'double-spend' })
      } else {
        ledger.value = {
          ...ledger.value,
          [checked.serial]: { serial: checked.serial, value: checked.value, merchant, at: new Date().toISOString() }
        }
        results.push({ serial: checked.serial, value: checked.value, status: 'credited' })
      }
    }
    return results
  }

  const notes = useLocalStorage<Record<string, StoredNote>>('win:kiosk:notes', {}, { initOnMounted: true })

  const stored = computed(() => Object.entries(notes.value).map(([id, note]) => ({ id, ...note })))

  function live() {
    const now = Date.now()
    return Object.fromEntries(Object.entries(notes.value).filter(([, note]) => new Date(note.expiresAt).getTime() > now))
  }

  function putNote(id: string, note: Omit<StoredNote, 'expiresAt'>) {
    const current = live()
    if (current[id]) {
      notes.value = current
      return false
    }
    const expiresAt = new Date(Date.now() + NOTE_DAYS * 86400000).toISOString()
    notes.value = { ...current, [id]: { ...note, expiresAt } }
    return true
  }

  function takeNote(id: string) {
    const current = live()
    const found = current[id]
    notes.value = Object.fromEntries(Object.entries(current).filter(([key]) => key !== id))
    return found ?? null
  }

  function reset() {
    ledger.value = {}
    notes.value = {}
  }

  return { ledger, balances, stored, submit, reset, putNote, takeNote }
}
