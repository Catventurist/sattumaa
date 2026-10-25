const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export type Algo = 'SHA-1' | 'SHA-256' | 'SHA-512'

export interface TotpParams {
  period: number
  digits: number
  algorithm: Algo
}

export function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '')
  const out: number[] = []
  let bits = 0
  let value = 0

  for (const ch of clean) {
    const idx = B32.indexOf(ch)
    if (idx === -1) throw new Error('Invalid base32')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
      value &= (1 << bits) - 1
    }
  }
  return new Uint8Array(out)
}

export async function totp(secret: string, p: TotpParams, now = Date.now()): Promise<string> {
  const counter = Math.floor(now / 1000 / p.period)
  const key = await crypto.subtle.importKey(
    'raw',
    base32Decode(secret),
    { name: 'HMAC', hash: p.algorithm },
    false,
    ['sign']
  )

  const msg = new ArrayBuffer(8)
  new DataView(msg).setBigUint64(0, BigInt(counter))

  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg))
  const off = h[h.length - 1]! & 0xf
  const bin = ((h[off]! & 0x7f) << 24) | (h[off + 1]! << 16) | (h[off + 2]! << 8) | h[off + 3]!

  return String(bin % 10 ** p.digits).padStart(p.digits, '0')
}

export function parseOtpauth(uri: string) {
  const url = new URL(uri)
  if (url.protocol !== 'otpauth:' || url.hostname !== 'totp') throw new Error('Unsupported')

  const label = decodeURIComponent(url.pathname.slice(1))
  const [labelIssuer, labelName] = label.includes(':') ? label.split(':') : ['', label]
  const q = url.searchParams

  return {
    issuer: q.get('issuer') ?? labelIssuer ?? '',
    name: (labelName ?? '').trim(),
    secret: (q.get('secret') ?? '').replace(/\s/g, ''),
    period: Number(q.get('period') ?? 30),
    digits: Number(q.get('digits') ?? 6),
    algorithm: `SHA-${(q.get('algorithm') ?? 'SHA1').replace('SHA', '')}` as Algo
  }
}
