interface OpenRequest {
  app: WinKey
  node: FsNode
  stamp: number
}

const KIND_APPS: Record<FsNode['kind'], WinKey[]> = {
  folder: ['explorer'],
  note: ['notes'],
  link: [],
  app: [],
  audio: ['media'],
  video: ['media'],
  image: ['pictures', 'paint', 'browser']
}

export function useFileOpen() {
  const pending = useState<OpenRequest | null>('file-open-pending', () => null)
  const { launch } = useWin()

  function appsFor(node: FsNode) {
    return KIND_APPS[node.kind]
  }

  function openWith(app: WinKey, node: FsNode) {
    pending.value = { app, node, stamp: Date.now() }
    launch(app)
  }

  function openNode(node: FsNode) {
    if (node.kind === 'link' && node.noteId) {
      openWith('notes', node)
      return true
    }
    if (node.appId) {
      launch(node.appId)
      return true
    }
    const [app] = appsFor(node)
    if (!app) {
      return false
    }
    openWith(app, node)
    return true
  }

  function take(app: WinKey) {
    if (pending.value?.app !== app) {
      return null
    }
    const request = pending.value
    pending.value = null
    return request
  }

  return { pending, appsFor, openWith, openNode, take }
}
