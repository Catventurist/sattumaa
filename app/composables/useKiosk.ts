import { useLocalStorage } from '@vueuse/core'

const ISSUER = 'kiosk.local'
const ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' } satisfies EcKeyGenParams
const SIGNING = { name: 'ECDSA', hash: 'SHA-256' } satisfies EcdsaParams

interface KioskKeys {
  publicJwk: JsonWebKey
  privateJwk: JsonWebKey
}

interface Claims {
  iss?: string
  jti?: string
  val?: number
  iat?: number
  exp?: number
}

export interface MintedToken {
  jwt: string
  serial: string
  value: number
  note: string[]
  expiresAt: string | null
}

export type VerifyResult
  = | { ok: false, reason: 'expired' | 'malformed' | 'signature' }
    | { ok: true, serial: string, value: number, expiresAt: string | null, note: string[] }

function fail(reason: 'expired' | 'malformed' | 'signature'): VerifyResult {
  return { ok: false, reason }
}

export function useKiosk() {
  const keys = useLocalStorage<KioskKeys | null>('win:kiosk:keys', null, { initOnMounted: true })
  const salt = useLocalStorage('win:kiosk:salt', 'commons')
  const fingerprint = ref('')

  watch(() => keys.value?.publicJwk, async (jwk) => {
    if (!jwk) {
      fingerprint.value = ''
      return
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${jwk.x}${jwk.y}`))
    fingerprint.value = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 12)
  }, { immediate: true })

  async function ensureKeys() {
    if (keys.value) return keys.value
    const pair = await crypto.subtle.generateKey(ALGORITHM, true, ['sign', 'verify'])
    const created = {
      publicJwk: await crypto.subtle.exportKey('jwk', pair.publicKey),
      privateJwk: await crypto.subtle.exportKey('jwk', pair.privateKey)
    }
    keys.value = created
    return created
  }

  async function rotate() {
    keys.value = null
    await ensureKeys()
  }

  async function mint(value: number, days: number): Promise<MintedToken> {
    const pair = await ensureKeys()
    const serial = newSerial()
    const issuedAt = Math.floor(Date.now() / 1000)
    const exp = days > 0 ? issuedAt + days * 86400 : undefined
    const signingInput = `${encodeJson({ alg: 'ES256', typ: 'JWT' })}.${encodeJson({ iss: ISSUER, jti: serial, val: value, iat: issuedAt, exp })}`
    const key = await crypto.subtle.importKey('jwk', pair.privateJwk, ALGORITHM, false, ['sign'])
    const signature = new Uint8Array(await crypto.subtle.sign(SIGNING, key, new TextEncoder().encode(signingInput)))
    return {
      jwt: `${signingInput}.${toBase64Url(signature)}`,
      serial,
      value,
      note: await deriveNote(serial, salt.value),
      expiresAt: exp ? new Date(exp * 1000).toISOString() : null
    }
  }

  async function verify(token: string): Promise<VerifyResult> {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return fail('malformed')
    const [header, payload, signature] = parts as [string, string, string]
    try {
      if (decodeJson<{ alg?: string }>(header).alg !== 'ES256') return fail('malformed')
      const claims = decodeJson<Claims>(payload)
      if (!keys.value) return fail('signature')
      const key = await crypto.subtle.importKey('jwk', keys.value.publicJwk, ALGORITHM, false, ['verify'])
      const valid = await crypto.subtle.verify(SIGNING, key, fromBase64Url(signature), new TextEncoder().encode(`${header}.${payload}`))
      if (!valid || claims.iss !== ISSUER) return fail('signature')
      if (typeof claims.jti !== 'string' || typeof claims.val !== 'number') return fail('malformed')
      if (claims.exp && claims.exp * 1000 < Date.now()) return fail('expired')
      return {
        ok: true,
        serial: claims.jti,
        value: claims.val,
        expiresAt: claims.exp ? new Date(claims.exp * 1000).toISOString() : null,
        note: await deriveNote(claims.jti, salt.value)
      }
    } catch {
      return fail('malformed')
    }
  }

  return { salt, fingerprint, mint, verify, rotate }
}
