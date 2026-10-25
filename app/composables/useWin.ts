export type WinState = 'closed' | 'open' | 'minimized'

export type WinKey = 'browser' | 'notes' | 'messages' | 'explorer' | 'media' | 'pictures' | 'settings' | 'board' | 'music' | 'clock' | 'paint' | 'sheet' | 'kiosk' | 'communication' | 'jitsi'

const WIN_KEYS: WinKey[] = ['browser', 'notes', 'messages', 'explorer', 'media', 'pictures', 'settings', 'board', 'music', 'clock', 'paint', 'sheet', 'kiosk', 'communication', 'jitsi']

export const START_APPS: Record<string, { icon: string, label: string }> = {
  browser: { icon: 'i-lucide-globe', label: 'taskbar.apps.browser' },
  messages: { icon: 'i-lucide-message-circle', label: 'taskbar.apps.messages' },
  notes: { icon: 'i-lucide-notebook-pen', label: 'taskbar.apps.notes' },
  explorer: { icon: 'i-lucide-folder', label: 'taskbar.apps.explorer' },
  media: { icon: 'i-lucide-play-circle', label: 'taskbar.apps.media' },
  pictures: { icon: 'i-lucide-image', label: 'taskbar.apps.pictures' },
  settings: { icon: 'i-lucide-settings', label: 'taskbar.apps.settings' },
  board: { icon: 'i-lucide-kanban', label: 'taskbar.apps.board' },
  clock: { icon: 'i-lucide-clock', label: 'taskbar.apps.clock' },
  paint: { icon: 'i-lucide-paintbrush', label: 'taskbar.apps.paint' },
  sheet: { icon: 'i-lucide-table-2', label: 'taskbar.apps.sheet' },
  kiosk: { icon: 'i-lucide-award', label: 'taskbar.apps.kiosk' },
  jitsi: { icon: 'i-lucide-speech', label: 'taskbar.apps.jitsi' },
  communication: { icon: 'i-lucide-radio-tower', label: 'taskbar.apps.communication' },
  music: { icon: 'i-lucide-music', label: 'taskbar.menu.music' },
  shutDown: { icon: 'i-lucide-power', label: 'taskbar.menu.shutDown' }
}

export function useWin() {
  const states = useState<Record<WinKey, WinState>>('win-states', () => ({
    browser: 'closed',
    notes: 'closed',
    messages: 'closed',
    explorer: 'closed',
    media: 'closed',
    pictures: 'closed',
    settings: 'closed',
    board: 'closed',
    music: 'closed',
    clock: 'closed',
    paint: 'closed',
    sheet: 'closed',
    kiosk: 'closed',
    communication: 'closed',
    jitsi: 'closed'
  }))

  const order = useState<WinKey[]>('win-order', () => [])
  const pinned = useState<string[]>('win-pinned', () => ['browser'])
  const favorites = useState<string[]>('win-favorites', () => [])

  const isWinKey = (key: string): key is WinKey => WIN_KEYS.includes(key as WinKey)

  const taskWindows = computed(() => WIN_KEYS.filter(key => states.value[key] !== 'closed'))

  const focused = computed(() =>
    [...order.value].reverse().find(key => states.value[key] === 'open') ?? null
  )

  const zIndex = (key: WinKey) => 30 + Math.max(0, order.value.indexOf(key))

  function focus(key: WinKey) {
    order.value = [...order.value.filter(k => k !== key), key]
  }

  function open(key: WinKey) {
    states.value[key] = 'open'
    focus(key)
  }

  function minimize(key: WinKey) {
    states.value[key] = 'minimized'
  }

  function close(key: WinKey) {
    states.value[key] = 'closed'
    order.value = order.value.filter(k => k !== key)
  }

  function toggle(key: WinKey) {
    if (states.value[key] === 'open' && focused.value === key) {
      minimize(key)
    } else {
      open(key)
    }
  }

  function launch(key: string) {
    if (isWinKey(key)) {
      open(key)
    }
    if (key === 'shutDown') {
      WIN_KEYS.forEach(close)
    }
  }

  return {
    states,
    pinned,
    favorites,
    taskWindows,
    focused,
    zIndex,
    focus,
    minimize,
    close,
    toggle,
    launch,
    isWinKey
  }
}

export function startApp(key: string) {
  return START_APPS[key] ?? { icon: 'i-lucide-app-window', label: key }
}

export type StartAppKey = keyof typeof START_APPS

export const isStartApp = (value: unknown): value is StartAppKey =>
  typeof value === 'string' && value in START_APPS

export interface FsNode {
  id: string
  parent: string | null
  kind: 'folder' | 'note' | 'link' | 'app' | 'audio' | 'video' | 'image'
  nameKey?: string
  name?: string
  appId?: string
  src?: string
  noteId?: string
  origin?: string
  deleted?: boolean
}

export const TRASH_ID = 'trash'

export const FS_NODES: Record<string, FsNode> = {
  root: { id: 'root', parent: null, kind: 'folder', nameKey: 'explorer.root' },
  docs: { id: 'docs', parent: 'root', kind: 'folder', nameKey: 'explorer.docs' },
  readme: { id: 'readme', parent: 'docs', kind: 'note', nameKey: 'explorer.readme' },
  music: { id: 'music', parent: 'root', kind: 'folder', nameKey: 'explorer.music' },
  song: { id: 'song', parent: 'music', kind: 'audio', nameKey: 'explorer.song', src: '/media/song.mp3' },
  clip: { id: 'clip', parent: 'music', kind: 'video', nameKey: 'explorer.clip', src: '/media/clip.mp4' },
  pictures: { id: 'pictures', parent: 'root', kind: 'folder', nameKey: 'explorer.pictures' },
  light: { id: 'light', parent: 'pictures', kind: 'image', nameKey: 'explorer.light', src: '/catbirch.webp' },
  dark: { id: 'dark', parent: 'pictures', kind: 'image', nameKey: 'explorer.dark', src: '/catbirchdark.webp' },
  trash: { id: 'trash', parent: 'root', kind: 'folder', nameKey: 'explorer.trash' }
}

export function mediaKind(src: string): 'audio' | 'video' {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src) ? 'video' : 'audio'
}

export const REORDER_SPRING = {
  type: 'spring',
  stiffness: 350,
  damping: 30
} as const

export const REORDER_DRAG_SCALE = 1.08

export interface GeoSite {
  id: string
  path: string
  color: 'info' | 'success' | 'warning' | 'error' | 'secondary'
  icon: string
  visits: number
}

export type GeoRoute
  = | { kind: 'directory' }
    | { kind: 'missing' }
    | { kind: 'page', site: GeoSite }
    | { kind: 'guestbook', site: GeoSite }

export const GEO_HOST = 'www.geocities.com'

export const GEO_SITES: GeoSite[] = [
  { id: 'ufo', path: 'Area51/5817', color: 'success', icon: 'i-lucide-orbit', visits: 4117 },
  { id: 'cats', path: 'Hollywood/2204', color: 'warning', icon: 'i-lucide-cat', visits: 20431 },
  { id: 'skins', path: 'SiliconValley/1337', color: 'info', icon: 'i-lucide-music', visits: 9988 }
]

export function geoUrl(path = '') {
  return `http://${GEO_HOST}/${path}`
}

export function geoNeighbor(site: GeoSite, step: number) {
  const index = GEO_SITES.findIndex(s => s.id === site.id)
  return GEO_SITES[(index + step + GEO_SITES.length) % GEO_SITES.length]!
}

export function resolveGeo(input: string): GeoRoute | null {
  let url: URL
  try {
    url = new URL(/^https?:\/\//.test(input) ? input : `http://${input}`)
  } catch {
    return null
  }
  if (url.hostname !== GEO_HOST && url.hostname !== 'geocities.com') return null
  const parts = url.pathname.split('/').filter(Boolean)
  if (!parts.length) return { kind: 'directory' }
  const site = GEO_SITES.find(s => s.path === parts.slice(0, 2).join('/'))
  if (!site) return { kind: 'missing' }
  const page = parts[2]
  if (!page || page === 'index.html') return { kind: 'page', site }
  if (page === 'guestbook.html') return { kind: 'guestbook', site }
  return { kind: 'missing' }
}

export function normalizeGeoUrl(input: string) {
  return /^https?:\/\//.test(input) ? input : `http://${input}`
}

export function useRun() {
  const isRunOpen = useState<boolean>('run-open', () => false)

  function toggleRun() {
    isRunOpen.value = !isRunOpen.value
  }

  return {
    isRunOpen,
    toggleRun
  }
}

export type PersonaId = 'new' | 'casual' | 'power' | 'catmin'

export const usePersona = () => useState<PersonaId>('persona', () => 'new')

export type NotifType = 'error' | 'warning' | 'info' | 'success'

export interface NotifItem {
  id: number
  type: NotifType
  key: string
  name: string
}

export const useNotifications = () => {
  const items = useState<NotifItem[]>('notifications', () => [
    { id: 1, type: 'error', key: 'deploy', name: 'web-app' },
    { id: 2, type: 'error', key: 'payment', name: 'Kitty inc' },
    { id: 3, type: 'warning', key: 'quota', name: '90%' },
    { id: 4, type: 'warning', key: 'expiry', name: 'Pro' },
    { id: 5, type: 'info', key: 'release', name: '4.7' },
    { id: 6, type: 'info', key: 'invite', name: 'Matti' },
    { id: 7, type: 'success', key: 'backup', name: 'db-main' },
    { id: 8, type: 'success', key: 'import', name: 'users.csv' }
  ])

  const unread = computed(() => items.value.length)

  return { items, unread }
}

export const useWorkflowT = () => {
  const { t } = useI18n()
  return (key: string, params: Record<string, unknown> = {}, plural?: number) =>
    plural === undefined
      ? t(`workflow.${key}`, params)
      : t(`workflow.${key}`, params, plural)
}

export function useMarkdownDocument(key = 'editor-content', initial = '') {
  const content = useState<string>(key, () => initial)

  function toMdc(markdown: string) {
    return markdown.replace(/^```mdc\r?\n([\s\S]*?)\r?\n```[ \t]*$/gm, '$1')
  }

  function download(filename = 'document.md') {
    if (!import.meta.client) return

    const blob = new Blob([toMdc(content.value)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function clear() {
    content.value = ''
  }

  return { content, download, clear }
}

/* export function useMarkdownDocument(key = 'editor-content', initial = '') {
  const content = ref(initial)

  onMounted(() => {
    content.value = localStorage.getItem(key) ?? initial
  })

  let timer: ReturnType<typeof setTimeout>
  watch(content, (value) => {
    if (!import.meta.client) return
    clearTimeout(timer)
    timer = setTimeout(() => localStorage.setItem(key, value), 500)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  function toMdc(markdown: string) {
    return markdown.replace(/^```mdc\r?\n([\s\S]*?)\r?\n```[ \t]*$/gm, '$1')
  }

  function download(filename = 'document.md') {
    if (!import.meta.client) return

    const blob = new Blob([toMdc(content.value)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function clear() {
    content.value = ''
    if (import.meta.client) localStorage.removeItem(key)
  }

  return { content, download, clear }
} */
