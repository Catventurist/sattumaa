// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/defaults'
import { SelectorKind } from 'eslint-plugin-better-tailwindcss/types'

const restrictedGlobals = ['open', 'close', 'focus', 'blur', 'print', 'stop', 'find', 'scroll', 'name', 'status', 'event']

export default withNuxt(
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        selectors: [
          ...getDefaultSelectors(),
          {
            kind: SelectorKind.Attribute,
            name: '^v-bind:ui$',
            match: [{ type: 'objectValues' }]
          }
        ]
      }
    },
    rules: {
      'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^stars$', '^star-layer$', '^star$'] }]
    }
  },
  {
    files: ['**/*.{vue,ts}'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...restrictedGlobals.map(name => ({
          name,
          message: `Use a local variable, or window.${name} if you mean the browser API`
        }))
      ]
    }
  }
)
