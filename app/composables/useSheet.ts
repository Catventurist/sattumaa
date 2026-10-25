import { useLocalStorage } from '@vueuse/core'

const SEED: Record<string, string> = {
  A1: 'Item',
  B1: 'Qty',
  C1: 'Price',
  D1: 'Total',
  A2: 'Floppy disks',
  B2: '10',
  C2: '1.5',
  D2: '=B2*C2',
  A3: 'CD-R',
  B3: '25',
  C3: '0.8',
  D3: '=B3*C3',
  A4: 'Modem',
  B4: '1',
  C4: '39',
  D4: '=B4*C4',
  A6: 'Total',
  B6: '=SUM(B2:B4)',
  D6: '=SUM(D2:D4)',
  A7: 'Average price',
  C7: '=ROUND(AVG(C2:C4), 2)'
}

export function useSheet() {
  const cells = useLocalStorage<Record<string, string>>('win:sheet:cells', { ...SEED }, { initOnMounted: true })
  const sheet = computed(() => {
    const data = cells.value
    return createSheet(id => data[id] ?? '')
  })

  function raw(id: string) {
    return cells.value[id] ?? ''
  }

  function read(id: string) {
    return sheet.value.value(id)
  }

  function set(id: string, text: string) {
    const rest = Object.fromEntries(Object.entries(cells.value).filter(([key]) => key !== id))
    cells.value = text === '' ? rest : { ...rest, [id]: text }
  }

  function reset() {
    cells.value = { ...SEED }
  }

  function clear() {
    cells.value = {}
  }

  function toCsv() {
    const quote = (text: string) => /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
    return Array.from({ length: ROWS }, (_unused, row) =>
      COLS.map((_col, col) => quote(String(read(cellId(col, row))))).join(',')
    ).join('\n')
  }

  return { raw, read, set, reset, clear, toCsv }
}
