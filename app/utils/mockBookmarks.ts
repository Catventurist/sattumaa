export interface Bookmark {
  label: string
  to: string
  folder?: string
}

export const mockBookmarks: Bookmark[] = [
  { label: 'Nuxt', to: 'https://nuxt.com', folder: 'Dev / Frameworks' },
  { label: 'Nuxt UI', to: 'https://ui.nuxt.com', folder: 'Dev / Frameworks' },
  { label: 'Vue.js', to: 'https://vuejs.org', folder: 'Dev / Frameworks' },
  { label: 'Vite', to: 'https://vite.dev', folder: 'Dev / Frameworks' },
  { label: 'Tailwind CSS', to: 'https://tailwindcss.com', folder: 'Dev / Frameworks' },

  { label: 'VueUse', to: 'https://vueuse.org', folder: 'Dev / Libraries' },
  { label: 'Motion for Vue', to: 'https://motion-vue.netlify.app', folder: 'Dev / Libraries' },
  { label: 'Reka UI', to: 'https://reka-ui.com', folder: 'Dev / Libraries' },
  { label: 'Iconify', to: 'https://iconify.design', folder: 'Dev / Libraries' },

  { label: 'MDN Web Docs', to: 'https://developer.mozilla.org', folder: 'Dev / Reference' },
  { label: 'Can I use', to: 'https://caniuse.com', folder: 'Dev / Reference' },
  { label: 'TypeScript Handbook', to: 'https://www.typescriptlang.org/docs/', folder: 'Dev / Reference' },
  { label: 'Stack Overflow', to: 'https://stackoverflow.com', folder: 'Dev / Reference' },

  { label: 'Hacker News', to: 'https://news.ycombinator.com', folder: 'News' },

  { label: 'YouTube', to: 'https://www.youtube.com', folder: 'Media' },
  { label: 'Spotify', to: 'https://open.spotify.com', folder: 'Media' },
  { label: 'Twitch', to: 'https://www.twitch.tv', folder: 'Media' },

  { label: 'GitHub', to: 'https://github.com', folder: 'Tools' },
  { label: 'Excalidraw', to: 'https://excalidraw.com', folder: 'Tools' },
  { label: 'Regex101', to: 'https://regex101.com', folder: 'Tools' },
  { label: 'Jitsi Meet', to: 'https://meet.jit.si', folder: 'Tools' },

  { label: 'OpenStreetMap', to: 'https://www.openstreetmap.org' }
]
