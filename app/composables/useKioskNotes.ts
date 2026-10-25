export function useKioskNotes() {
  const server = useKioskServer()

  async function attach(serial: string, text: string): Promise<'exists' | 'invalid' | 'ok'> {
    if (!isSerial(serial)) return 'invalid'
    const note = await encryptNote(text, await noteKey(serial))
    return server.putNote(await noteLookupId(serial), note) ? 'ok' : 'exists'
  }

  async function read(serial: string): Promise<{ ok: false, reason: 'gone' | 'invalid' } | { ok: true, text: string }> {
    if (!isSerial(serial)) return { ok: false, reason: 'invalid' }
    const found = server.takeNote(await noteLookupId(serial))
    if (!found) return { ok: false, reason: 'gone' }
    try {
      return { ok: true, text: await decryptNote(found, await noteKey(serial)) }
    } catch {
      return { ok: false, reason: 'gone' }
    }
  }

  return { attach, read, stored: server.stored }
}
