import type { Algo } from '~/utils/totp'

export interface Account {
  id: string
  issuer: string
  name: string
  secret: string
  period: number
  digits: number
  algorithm: Algo
}

export interface VaultFile {
  v: 1
  salt: string
  iv: string
  data: string
}

/* const STORAGE_KEY = 'totp-vault' */
const IDLE_MS = 5 * 60 * 1000

const enc = new TextEncoder()
const dec = new TextDecoder()

const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromB64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), c => c.charCodeAt(0))

async function deriveKey(pass: string, salt: Uint8Array<ArrayBuffer>) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export function useVault() {
  /* const blob = ref<VaultFile | null>(null) */
  const blob = useState<VaultFile | null>('vault-blob', () => null)
  const accounts = ref<Account[]>([])
  const unlocked = ref(false)

  let key: CryptoKey | null = null
  let saltB64 = ''
  let lastActive = Date.now()
  let timer: ReturnType<typeof setInterval> | undefined

  const touch = () => {
    lastActive = Date.now()
  }

  onMounted(() => {
    timer = setInterval(() => {
      if (unlocked.value && Date.now() - lastActive > IDLE_MS) lock()
    }, 10_000)
  })

  /* onMounted(() => {
    try {
      blob.value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    } catch {
      blob.value = null
    }
    timer = setInterval(() => {
      if (unlocked.value && Date.now() - lastActive > IDLE_MS) lock()
    }, 10_000)
  }) */

  /* watch(blob, (b) => {
    if (b) localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
    if (unlocked.value && b?.salt !== saltB64) lock()
  }) */

  onBeforeUnmount(() => clearInterval(timer))

  watch(blob, (b) => {
    if (unlocked.value && b?.salt !== saltB64) lock()
  })

  async function persist() {
    if (!key) return
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(JSON.stringify(accounts.value))
    )
    blob.value = { v: 1, salt: saltB64, iv: toB64(iv), data: toB64(data) }
  }

  async function create(pass: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    saltB64 = toB64(salt)
    key = await deriveKey(pass, salt)
    accounts.value = []
    unlocked.value = true
    touch()
    await persist()
  }

  async function unlock(pass: string) {
    if (!blob.value) throw new Error('No vault')
    const derived = await deriveKey(pass, fromB64(blob.value.salt))
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromB64(blob.value.iv) },
      derived,
      fromB64(blob.value.data)
    )
    key = derived
    saltB64 = blob.value.salt
    accounts.value = JSON.parse(dec.decode(plain))
    unlocked.value = true
    touch()
  }

  function lock() {
    key = null
    accounts.value = []
    unlocked.value = false
  }

  async function add(account: Omit<Account, 'id'>) {
    accounts.value.push({ ...account, id: crypto.randomUUID() })
    touch()
    await persist()
  }

  async function remove(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id)
    touch()
    await persist()
  }

  return { blob, accounts, unlocked, create, unlock, lock, add, remove, touch }
}
