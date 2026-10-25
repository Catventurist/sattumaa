import { useLocalStorage } from '@vueuse/core'
import { TRASH_ID } from './useWin'

interface FsState {
  created: Record<string, FsNode>
  patches: Record<string, Partial<FsNode>>
}

export function useFileSystem() {
  const { t } = useI18n()

  const state = useLocalStorage<FsState>('win:fs', { created: {}, patches: {} }, {
    mergeDefaults: true,
    initOnMounted: true
  })

  const nodes = computed(() => {
    const all: Record<string, FsNode> = {}
    for (const node of [...Object.values(FS_NODES), ...Object.values(state.value.created)]) {
      const merged = { ...node, ...state.value.patches[node.id] }
      if (!merged.deleted) all[node.id] = merged
    }
    return all
  })

  function label(node: FsNode) {
    return node.name ?? (node.nameKey ? t(node.nameKey) : node.id)
  }

  function childrenOf(id: string) {
    return Object.values(nodes.value).filter(n => n.parent === id)
  }

  function descendants(id: string): string[] {
    return childrenOf(id).flatMap(c => [c.id, ...descendants(c.id)])
  }

  function inTrash(id: string) {
    let current = nodes.value[id]
    while (current) {
      if (current.id === TRASH_ID) return true
      current = current.parent ? nodes.value[current.parent] : undefined
    }
    return false
  }

  function patch(id: string, value: Partial<FsNode>) {
    state.value.patches[id] = { ...state.value.patches[id], ...value }
  }

  function create(parent: string, kind: FsNode['kind'], extra: Partial<FsNode>) {
    const id = crypto.randomUUID()
    state.value.created[id] = { id, parent, kind, ...extra }
    return id
  }

  function rename(id: string, name: string) {
    const text = name.trim()
    if (text) patch(id, { name: text })
  }

  function remove(id: string) {
    const node = nodes.value[id]
    if (!node || id === 'root' || id === TRASH_ID || inTrash(id)) return
    patch(id, { parent: TRASH_ID, origin: node.parent ?? 'root' })
  }

  function restore(id: string) {
    const node = nodes.value[id]
    if (!node) return
    const target = node.origin && nodes.value[node.origin] && !inTrash(node.origin) ? node.origin : 'root'
    patch(id, { parent: target, origin: undefined })
  }

  function purge(ids: string[]) {
    const gone = new Set(ids)
    const wasCreated = new Set(Object.keys(state.value.created))

    state.value.created = Object.fromEntries(
      Object.entries(state.value.created).filter(([key]) => !gone.has(key))
    )

    const kept = Object.entries(state.value.patches).filter(([key]) => !(gone.has(key) && wasCreated.has(key)))
    state.value.patches = Object.fromEntries(kept)

    for (const id of ids) {
      if (!wasCreated.has(id)) patch(id, { deleted: true })
    }
  }

  function deleteForever(id: string) {
    if (inTrash(id) && id !== TRASH_ID) purge([id, ...descendants(id)])
  }

  function emptyTrash() {
    purge(childrenOf(TRASH_ID).flatMap(c => [c.id, ...descendants(c.id)]))
  }

  return {
    nodes,
    label,
    childrenOf,
    inTrash,
    create,
    rename,
    remove,
    restore,
    deleteForever,
    emptyTrash
  }
}
