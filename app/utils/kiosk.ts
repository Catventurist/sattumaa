const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const ADJECTIVES = ['quiet', 'amber', 'silver', 'gentle', 'brave', 'hollow', 'golden', 'swift', 'sleepy', 'bright', 'wild', 'humble', 'crisp', 'misty', 'velvet', 'lucky']
const NOUNS = ['river', 'lantern', 'sparrow', 'orchard', 'harbor', 'meadow', 'compass', 'ember', 'willow', 'pebble', 'thunder', 'mirror', 'kettle', 'garden', 'comet', 'anchor']
const VERBS = ['hums', 'waits', 'drifts', 'glows', 'wanders', 'listens', 'dances', 'rests', 'sings', 'climbs', 'mends', 'blooms', 'sails', 'whispers', 'gathers', 'shines']

function word(list: string[], index: number) {
  return list[index]!
}

export function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export function fromBase64Url(text: string) {
  const padded = text.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(text.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0))
}

export function encodeJson(value: unknown) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)))
}

export function decodeJson<T>(text: string): T {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(text))) as T
}

export function newSerial() {
  const chars = Array.from(crypto.getRandomValues(new Uint8Array(10)), byte => ALPHABET[byte % ALPHABET.length])
  return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`
}

export async function deriveNote(serial: string, salt: string) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${serial}${salt}`)))
  const byte = (index: number) => digest[index]!
  return [
    `${word(ADJECTIVES, byte(0) >> 4)} ${word(NOUNS, byte(0) & 15)} ${word(VERBS, byte(1) >> 4)}`,
    `${word(ADJECTIVES, byte(1) & 15)} ${word(NOUNS, byte(2) >> 4)} ${word(VERBS, byte(2) & 15)}`,
    `${word(ADJECTIVES, byte(3) >> 4)} ${word(NOUNS, byte(3) & 15)} ${word(VERBS, byte(4) >> 4)}`
  ]
}

export function pseudoQr(text: string, size = 25) {
  let seed = 2166136261
  for (const char of text) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619)

  function random() {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const cells = Array.from({ length: size }, () => Array.from({ length: size }, () => random() > 0.5))

  function finder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = top + r
        const x = left + c
        if (y < 0 || x < 0 || y >= size || x >= size) continue
        const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        cells[y]![x] = inside && (edge || core)
      }
    }
  }

  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)
  return cells
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

function normalize(serial: string) {
  return serial.trim().toUpperCase()
}

export function isSerial(text: string) {
  return /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/.test(normalize(text))
}

export function noteLookupId(serial: string) {
  return sha256Hex(`lookup:${normalize(serial)}`)
}

export async function noteKey(serial: string) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalize(serial)), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('kiosk-note-v1'), iterations: 100000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptNote(text: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text))
  return { iv: toBase64Url(iv), ciphertext: toBase64Url(new Uint8Array(data)) }
}

export async function decryptNote(note: { iv: string, ciphertext: string }, key: CryptoKey) {
  const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64Url(note.iv) }, key, fromBase64Url(note.ciphertext))
  return new TextDecoder().decode(data)
}
