import { useLocalStorage } from '@vueuse/core'

export function useGallery() {
  const stored = useLocalStorage<string[]>('win:gallery:order', [])
  const selected = useState<string | null>('gallery:selected', () => null)

  const fs = useFileSystem()
  const all = computed(() => Object.values(fs.nodes.value)
    .filter(n => n.kind === 'image' && n.src && !fs.inTrash(n.id))
    .map(n => n.id))

  const order = computed({
    get: () => [
      ...stored.value.filter(id => all.value.includes(id)),
      ...all.value.filter(id => !stored.value.includes(id))
    ],
    set: (value: string[]) => {
      stored.value = value
    }
  })

  function reset() {
    stored.value = []
  }

  return { order, selected, reset }
}
