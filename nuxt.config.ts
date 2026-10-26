export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    'motion-v/nuxt'
  ],
  devtools: { enabled: false },
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in', appear: true },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: ['~/assets/css/main.css'],
  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },
  colorMode: {
    preference: 'dark',
    fallback: 'light',
    storage: 'sessionStorage'
  },
  content: {
    experimental: {
      nativeSqlite: true
    },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          },
          langs: ['ts', 'vue', 'md', 'mdc', 'bash', 'json', 'yaml']
        }
      }
    }
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
    }
  },
  compatibilityDate: '2026-10-25',
  nitro: {
    vercel: {
      functions: {
        runtime: 'bun1.4.x'
      }
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@shikijs/core',
        '@shikijs/engine-javascript',
        '@shikijs/engine-oniguruma',
        '@shikijs/langs/css',
        '@shikijs/langs/html',
        '@shikijs/langs/javascript',
        '@shikijs/langs/json',
        '@shikijs/langs/markdown',
        '@shikijs/langs/mdc',
        '@shikijs/langs/shellscript',
        '@shikijs/langs/tsx',
        '@shikijs/langs/typescript',
        '@shikijs/langs/vue',
        '@shikijs/langs/yaml',
        '@shikijs/transformers',
        'shiki/wasm',
        '@tiptap/extension-text-align',
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor',
        'motion-v',
        '@tanstack/charts/tooltip',
        'd3-shape'
      ]
    }
  },
  telemetry: false,
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  fonts: {
    provider: 'bunny',
    defaults: {
      preload: true
    },
    families: [
      { name: 'Finlandica' }
    ]
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', flag: '🇺🇸', dir: 'ltr', file: 'en.yml' },
      { code: 'fi', name: 'Suomi', language: 'fi-FI', flag: '🇫🇮', dir: 'ltr', file: 'fi.yml' }
    ],
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root'
    }
  }
})
