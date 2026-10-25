import { useLocalStorage } from '@vueuse/core'

export const ACCENTS = ['blue', 'sky', 'indigo', 'violet', 'green', 'emerald', 'amber', 'orange', 'rose'] as const

export type Accent = typeof ACCENTS[number]

export interface Settings {
  taskbarAutoHide: boolean
  startMenuMode: 'popover' | 'tabbar'
  clock24h: boolean
  wallpaper: string | null
  accent: Accent
  musicRepeat: boolean
  musicVolume: number
}

const defaults: Settings = {
  taskbarAutoHide: false,
  startMenuMode: 'tabbar',
  clock24h: true,
  wallpaper: null,
  accent: 'blue',
  musicRepeat: false,
  musicVolume: 70
}

export function useSettings() {
  const settings = useLocalStorage<Settings>('win:settings', defaults, {
    mergeDefaults: true,
    initOnMounted: true
  })

  function reset() {
    settings.value = { ...defaults }
  }

  return { settings, reset }
}
