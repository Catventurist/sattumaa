export type CellValue = string | number

type Operand = CellValue | number[]

interface Token {
  type: 'num' | 'ref' | 'name' | 'op'
  value: string
}

export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
export const ROWS = 20

class SheetError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.code = code
  }
}

const COMPARE: Record<string, (a: number, b: number) => boolean> = {
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '=': (a, b) => a === b,
  '<>': (a, b) => a !== b
}

export function cellId(col: number, row: number) {
  return `${COLS[col]}${row + 1}`
}

export function parseRef(id: string) {
  const match = /^([A-Z])(\d+)$/.exec(id)
  const col = match ? COLS.indexOf(match[1]!) : -1
  const row = match ? Number(match[2]) - 1 : -1
  if (col < 0 || row < 0 || row >= ROWS) throw new SheetError('#REF!')
  return { col, row }
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  const pattern = /\s*(?:(\d+\.?\d*)|([A-Za-z]+\d+)|([A-Za-z]+)|(<>|>=|<=|[-+*/^(),:<>=]))/y
  let index = 0
  while (index < source.length) {
    pattern.lastIndex = index
    const match = pattern.exec(source)
    if (!match) {
      if (!source.slice(index).trim()) break
      throw new SheetError('#ERR')
    }
    index = pattern.lastIndex
    if (match[1] !== undefined) tokens.push({ type: 'num', value: match[1] })
    else if (match[2]) tokens.push({ type: 'ref', value: match[2].toUpperCase() })
    else if (match[3]) tokens.push({ type: 'name', value: match[3].toUpperCase() })
    else tokens.push({ type: 'op', value: match[4]! })
  }
  return tokens
}

function num(operand: Operand | undefined): number {
  if (operand === undefined || Array.isArray(operand)) throw new SheetError('#VALUE!')
  if (operand === '') return 0
  if (typeof operand === 'string') throw new SheetError(operand.startsWith('#') ? operand : '#VALUE!')
  return operand
}

function flat(args: Operand[]) {
  return args.flatMap(arg => Array.isArray(arg) ? arg : [num(arg)])
}

function average(args: Operand[]) {
  const numbers = flat(args)
  if (!numbers.length) throw new SheetError('#DIV/0!')
  return numbers.reduce((total, n) => total + n, 0) / numbers.length
}

const FUNCTIONS: Record<string, (args: Operand[]) => Operand> = {
  SUM: args => flat(args).reduce((total, n) => total + n, 0),
  AVG: average,
  AVERAGE: average,
  MIN: args => Math.min(...flat(args)),
  MAX: args => Math.max(...flat(args)),
  COUNT: args => flat(args).length,
  ABS: args => Math.abs(num(args[0])),
  ROUND: (args) => {
    const factor = 10 ** (args[1] === undefined ? 0 : num(args[1]))
    return Math.round(num(args[0]) * factor) / factor
  },
  IF: args => num(args[0]) ? (args[1] ?? 0) : (args[2] ?? 0)
}

export function createSheet(raw: (id: string) => string) {
  const cache = new Map<string, CellValue>()
  const stack = new Set<string>()

  function evaluateCell(id: string): CellValue {
    try {
      return compute(raw(id))
    } catch (error) {
      return error instanceof SheetError ? error.code : '#ERR'
    }
  }

  function value(id: string): CellValue {
    const cached = cache.get(id)
    if (cached !== undefined) return cached
    if (stack.has(id)) return '#CYCLE!'
    stack.add(id)
    const result = evaluateCell(id)
    stack.delete(id)
    cache.set(id, result)
    return result
  }

  function compute(source: string): CellValue {
    if (!source.startsWith('=')) {
      const trimmed = source.trim().replace(',', '.')
      return trimmed !== '' && !Number.isNaN(Number(trimmed)) ? Number(trimmed) : source
    }
    const result = evaluate(tokenize(source.slice(1)))
    if (Array.isArray(result)) throw new SheetError('#VALUE!')
    if (typeof result === 'number') {
      if (!Number.isFinite(result)) throw new SheetError('#NUM!')
      return Math.round(result * 1e10) / 1e10
    }
    return result
  }

  function range(from: string, to: string) {
    const a = parseRef(from)
    const b = parseRef(to)
    const numbers: number[] = []
    for (let col = Math.min(a.col, b.col); col <= Math.max(a.col, b.col); col++) {
      for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row++) {
        const cell = value(cellId(col, row))
        if (typeof cell === 'number') numbers.push(cell)
        else if (cell.startsWith('#')) throw new SheetError(cell)
      }
    }
    return numbers
  }

  function evaluate(tokens: Token[]): Operand {
    let pos = 0

    function peek() {
      return tokens[pos]
    }

    function next() {
      return tokens[pos++]
    }

    function isOp(...ops: string[]) {
      const token = peek()
      return token?.type === 'op' && ops.includes(token.value)
    }

    function expect(op: string) {
      if (!isOp(op)) throw new SheetError('#ERR')
      pos++
    }

    function comparison(): Operand {
      let left = additive()
      while (isOp(...Object.keys(COMPARE))) {
        const op = next()!.value
        const right = additive()
        left = Number(COMPARE[op]!(num(left), num(right)))
      }
      return left
    }

    function additive(): Operand {
      let left = term()
      while (isOp('+', '-')) {
        const op = next()!.value
        const right = term()
        left = op === '+' ? num(left) + num(right) : num(left) - num(right)
      }
      return left
    }

    function term(): Operand {
      let left = power()
      while (isOp('*', '/')) {
        const op = next()!.value
        const right = num(power())
        if (op === '/' && right === 0) throw new SheetError('#DIV/0!')
        left = op === '*' ? num(left) * right : num(left) / right
      }
      return left
    }

    function power(): Operand {
      const base = unary()
      if (isOp('^')) {
        pos++
        return num(base) ** num(power())
      }
      return base
    }

    function unary(): Operand {
      if (isOp('-')) {
        pos++
        return -num(unary())
      }
      if (isOp('+')) {
        pos++
        return unary()
      }
      return primary()
    }

    function primary(): Operand {
      const token = next()
      if (!token) throw new SheetError('#ERR')
      if (token.type === 'num') return Number(token.value)
      if (token.type === 'ref') {
        parseRef(token.value)
        if (isOp(':')) {
          pos++
          const end = next()
          if (end?.type !== 'ref') throw new SheetError('#REF!')
          return range(token.value, end.value)
        }
        return value(token.value)
      }
      if (token.type === 'name') {
        expect('(')
        const args: Operand[] = []
        if (!isOp(')')) {
          args.push(comparison())
          while (isOp(',')) {
            pos++
            args.push(comparison())
          }
        }
        expect(')')
        const fn = FUNCTIONS[token.value]
        if (!fn) throw new SheetError('#NAME?')
        return fn(args)
      }
      if (token.value === '(') {
        const inner = comparison()
        expect(')')
        return inner
      }
      throw new SheetError('#ERR')
    }

    const result = comparison()
    if (pos < tokens.length) throw new SheetError('#ERR')
    return result
  }

  return { value }
}
