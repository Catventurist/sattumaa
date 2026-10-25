export interface LocalFileOptions<T> {
  description?: string
  mime?: string
  extensions?: string[]
  suggestedName?: string
  serialize?: (data: T) => string
  parse?: (text: string) => T
}

export function useLocalFile<T = unknown>(options: LocalFileOptions<T> = {}) {
  const {
    description = 'JSON',
    mime = 'application/json',
    extensions = ['.json'],
    suggestedName = 'data.json',
    serialize = (data: T) => JSON.stringify(data, null, 2),
    parse = (text: string) => JSON.parse(text) as T
  } = options

  const handle = shallowRef<FileSystemFileHandle | null>(null)
  const fallbackName = ref<string | null>(null)
  const name = computed(() => handle.value?.name ?? fallbackName.value)

  const native = computed(() => import.meta.client && 'showOpenFilePicker' in window)
  const types = [{ description, accept: { [mime]: extensions } }] as FilePickerAcceptType[]

  const isAbort = (e: unknown) => (e as DOMException)?.name === 'AbortError'

  function pickWithInput(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = extensions.join(',')
      input.onchange = () => resolve(input.files?.[0] ?? null)
      input.oncancel = () => resolve(null)
      input.click()
    })
  }

  async function open(): Promise<T | null> {
    try {
      let file: File | null
      if (native.value) {
        const [picked] = await window.showOpenFilePicker({ types })
        handle.value = picked!
        file = await picked!.getFile()
      } else {
        file = await pickWithInput()
        fallbackName.value = file?.name ?? null
      }
      return file ? parse(await file.text()) : null
    } catch (e) {
      if (isAbort(e)) return null
      throw e
    }
  }

  async function hasWriteAccess(h: FileSystemFileHandle): Promise<boolean> {
    const opts = { mode: 'readwrite' } as const
    if (await h.queryPermission(opts) === 'granted') return true
    return await h.requestPermission(opts) === 'granted'
  }

  function download(data: T): boolean {
    const blob = new Blob([serialize(data)], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fallbackName.value ?? suggestedName
    a.click()
    URL.revokeObjectURL(url)
    return true
  }

  async function write(data: T): Promise<boolean> {
    if (!handle.value) return false
    if (!(await hasWriteAccess(handle.value))) return false
    const writable = await handle.value.createWritable()
    await writable.write(serialize(data))
    await writable.close()
    return true
  }

  async function saveAs(data: T): Promise<boolean> {
    if (!native.value) return download(data)
    try {
      handle.value = await window.showSaveFilePicker({ suggestedName, types })
      return await write(data)
    } catch (e) {
      if (isAbort(e)) return false
      throw e
    }
  }

  async function save(data: T): Promise<boolean> {
    if (!native.value) return download(data)
    return handle.value ? write(data) : saveAs(data)
  }

  return { native, name, handle, open, save, saveAs }
}
