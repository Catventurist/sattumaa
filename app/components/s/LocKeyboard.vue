<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

interface KeyDef {
  id: string
  main?: string
  top?: string
  icon?: string
  label?: string
  fn?: string
  size?: number
  align?: 'left' | 'right'
  code?: string
  kind?: 'arrows' | 'touch'
}

type LayoutId = 'en' | 'fi'
type Platform = 'mac' | 'windows'

const { t, locale } = useI18n()

const layout = ref<LayoutId>(locale.value === 'fi' ? 'fi' : 'en')
const platform = ref<Platform>('mac')
const layouts: LayoutId[] = ['en', 'fi']
const platforms: Platform[] = ['mac', 'windows']

const chars = (s: string): KeyDef[] =>
  s.split('').map(c => ({ id: c, main: c, code: `Key${c}` }))

const sym = (id: string, main: string, top?: string, code = id): KeyDef => ({ id, main, top, code })

const mod = (id: string, label: string, size: number, align: 'left' | 'right' = 'left', code = id): KeyDef =>
  ({ id, label, size, align, code })

const iconMod = (id: string, icon: string, label: string, size = 1, code = id): KeyDef =>
  ({ id, icon, label, size, code })

const withLastSize = (keys: KeyDef[], size: number) =>
  keys.map((k, i) => (i === keys.length - 1 ? { ...k, size } : k))

const body: Record<LayoutId, { num: KeyDef[], top: KeyDef[], home: KeyDef[], shift: KeyDef[] }> = {
  en: {
    num: [
      sym('`', '`', '~', 'Backquote'),
      ...['1!', '2@', '3#', '4$', '5%', '6^', '7&', '8*', '9(', '0)']
        .map(s => sym(s[0]!, s[0]!, s[1], `Digit${s[0]}`)),
      sym('-', '-', '_', 'Minus'),
      sym('=', '=', '+', 'Equal')
    ],
    top: [
      ...chars('QWERTYUIOP'),
      sym('[', '[', '{', 'BracketLeft'),
      sym(']', ']', '}', 'BracketRight'),
      sym('\\', '\\', '|', 'Backslash')
    ],
    home: [
      ...chars('ASDFGHJKL'),
      sym(';', ';', ':', 'Semicolon'),
      sym('\'', '\'', '"', 'Quote')
    ],
    shift: [
      mod('shiftL', 'shift', 2.25, 'left', 'ShiftLeft'),
      ...chars('ZXCVBNM'),
      sym(',', ',', '<', 'Comma'),
      sym('.', '.', '>', 'Period'),
      sym('/', '/', '?', 'Slash')
    ]
  },
  fi: {
    num: [
      sym('§', '§', '½', 'Backquote'),
      ...[['1', '!'], ['2', '"'], ['3', '#'], ['4', '¤'], ['5', '%'], ['6', '&'], ['7', '/'], ['8', '('], ['9', ')'], ['0', '=']]
        .map(([m, s]) => sym(m!, m!, s, `Digit${m}`)),
      sym('+', '+', '?', 'Minus'),
      sym('´', '´', '`', 'Equal')
    ],
    top: [
      ...chars('QWERTYUIOP'),
      sym('å', 'Å', undefined, 'BracketLeft'),
      sym('¨', '¨', '^', 'BracketRight'),
      sym('\'', '\'', '*', 'Backslash')
    ],
    home: [
      ...chars('ASDFGHJKL'),
      sym('ö', 'Ö', undefined, 'Semicolon'),
      sym('ä', 'Ä', undefined, 'Quote')
    ],
    shift: [
      mod('shiftL', 'shift', 1.25, 'left', 'ShiftLeft'),
      sym('<', '<', '>', 'IntlBackslash'),
      ...chars('ZXCVBNM'),
      sym(',', ',', ';', 'Comma'),
      sym('.', '.', ':', 'Period'),
      sym('-', '-', '_', 'Slash')
    ]
  }
}

const macFn: KeyDef[] = [
  { id: 'esc', label: 'esc', size: 1.5, code: 'Escape' },
  ...[
    'sun-dim', 'sun', 'layout-grid', 'search', 'mic', 'moon',
    'skip-back', 'play', 'skip-forward', 'volume-x', 'volume-1', 'volume-2'
  ].map((icon, i) => ({ id: `F${i + 1}`, icon: `i-lucide-${icon}`, fn: `F${i + 1}`, code: `F${i + 1}` })),
  { id: 'touch', kind: 'touch', icon: 'i-lucide-fingerprint' }
]

const winFn: KeyDef[] = [
  { id: 'esc', label: 'esc', code: 'Escape' },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `F${i + 1}`, main: `F${i + 1}`, code: `F${i + 1}` })),
  mod('del', 'del', 2, 'right', 'Delete')
]

const arrowKey: KeyDef = { id: 'arrows', kind: 'arrows', size: 3 }

const macBottom: KeyDef[] = [
  iconMod('fn', 'i-lucide-globe', '', 1, 'Fn'),
  iconMod('ctrl', 'i-lucide-chevron-up', 'control', 1, 'ControlLeft'),
  iconMod('alt', 'i-lucide-option', 'option', 1, 'AltLeft'),
  iconMod('metaL', 'i-lucide-command', 'command', 1.25, 'MetaLeft'),
  { id: 'space', size: 5, code: 'Space' },
  iconMod('metaR', 'i-lucide-command', 'command', 1.25, 'MetaRight'),
  iconMod('altR', 'i-lucide-option', 'option', 1, 'AltRight'),
  arrowKey
]

const winBottom = (l: LayoutId): KeyDef[] => [
  mod('ctrl', 'ctrl', 1.25, 'left', 'ControlLeft'),
  { id: 'win', icon: 'i-lucide-layout-grid', size: 1.25, code: 'MetaLeft' },
  mod('alt', 'alt', 1.25, 'left', 'AltLeft'),
  { id: 'space', size: 5.75, code: 'Space' },
  mod('altR', l === 'fi' ? 'altGr' : 'alt', 1.25, 'left', 'AltRight'),
  mod('ctrlR', 'ctrl', 1.25, 'left', 'ControlRight'),
  arrowKey
]

const rows = computed<KeyDef[][]>(() => {
  const b = body[layout.value]
  const win = platform.value === 'windows'

  return [
    win ? winFn : macFn,
    [
      ...b.num,
      win
        ? mod('bs', 'backspace', 2, 'right', 'Backspace')
        : mod('del', 'delete', 1.5, 'right', 'Backspace')
    ],
    [
      mod('tab', 'tab', 1.5, 'left', 'Tab'),
      ...withLastSize(b.top, win ? 1.5 : 1)
    ],
    [
      mod('caps', 'capsLock', 1.75, 'left', 'CapsLock'),
      ...b.home,
      win
        ? mod('ret', 'enter', 2.25, 'right', 'Enter')
        : mod('ret', 'return', 1.75, 'right', 'Enter')
    ],
    [
      ...b.shift,
      mod('shiftR', 'shift', win ? 2.75 : 2.25, 'right', 'ShiftRight')
    ],
    win ? winBottom(layout.value) : macBottom
  ]
})

const arrows = [
  { id: 'up', icon: 'i-lucide-arrow-up', code: 'ArrowUp' },
  { id: 'down', icon: 'i-lucide-arrow-down', code: 'ArrowDown' }
]

const pressed = ref(new Set<string>())

function onKey(e: KeyboardEvent, down: boolean) {
  const next = new Set(pressed.value)
  if (down) next.add(e.code)
  else next.delete(e.code)
  pressed.value = next
}

if (import.meta.client) {
  useEventListener(window, 'keydown', e => onKey(e, true))
  useEventListener(window, 'keyup', e => onKey(e, false))
  useEventListener(window, 'blur', () => (pressed.value = new Set()))
}

const isDown = (code?: string) => !!code && pressed.value.has(code)

const keyClass = 'h-10 sm:h-11 md:h-12 rounded-md bg-default text-highlighted ring ring-default shadow-xs '
  + 'flex flex-col items-center justify-center select-none cursor-pointer '
  + 'transition duration-75 ease-out hover:bg-muted hover:-translate-y-px '
  + 'active:translate-y-0 active:scale-95 active:bg-accented active:shadow-none'
</script>

<template>
  <div class="mx-auto w-full max-w-3xl space-y-3">
    <div class="flex justify-end gap-2">
      <UFieldGroup>
        <UButton
          v-for="p in platforms"
          :key="p"
          size="sm"
          color="primary"
          :variant="platform === p ? 'solid' : 'outline'"
          :label="t(`keyboard.platforms.${p}`)"
          @click="platform = p"
        />
      </UFieldGroup>

      <UFieldGroup>
        <UButton
          v-for="l in layouts"
          :key="l"
          size="sm"
          color="primary"
          :variant="layout === l ? 'solid' : 'outline'"
          :label="t(`keyboard.layouts.${l}`)"
          @click="layout = l"
        />
      </UFieldGroup>
    </div>

    <div
      class="rounded-2xl bg-elevated p-2 sm:p-3 ring ring-default shadow-lg space-y-0.75 sm:space-y-1"
      role="group"
      :aria-label="t('keyboard.ariaLabel')"
    >
      <div
        v-for="(row, r) in rows"
        :key="`${platform}-${layout}-${r}`"
        class="flex items-end gap-0.75 sm:gap-1"
      >
        <template
          v-for="key in row"
          :key="key.id"
        >
          <div
            v-if="key.kind === 'arrows'"
            class="flex items-center gap-0.75 sm:gap-1"
            :style="{ flex: `${key.size} 1 0%` }"
          >
            <button
              :class="[keyClass, 'flex-1', isDown('ArrowLeft') && 'scale-95 bg-accented']"
              type="button"
              :aria-label="t('keyboard.keys.left')"
            >
              <UIcon
                name="i-lucide-arrow-left"
                class="size-3 text-muted"
              />
            </button>

            <div class="flex flex-1 flex-col gap-px">
              <button
                v-for="a in arrows"
                :key="a.id"
                type="button"
                :class="[
                  keyClass,
                  'h-4.75 sm:h-5.25 md:h-5.75',
                  a.id === 'up' ? 'rounded-b-none' : 'rounded-t-none',
                  isDown(a.code) && 'scale-95 bg-accented'
                ]"
                :aria-label="t(`keyboard.keys.${a.id}`)"
              >
                <UIcon
                  :name="a.icon"
                  class="size-2.5 text-muted"
                />
              </button>
            </div>

            <button
              :class="[keyClass, 'flex-1', isDown('ArrowRight') && 'scale-95 bg-accented']"
              type="button"
              :aria-label="t('keyboard.keys.right')"
            >
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3 text-muted"
              />
            </button>
          </div>

          <button
            v-else
            type="button"
            :class="[
              keyClass,
              key.align === 'right' && 'items-end pr-2',
              key.align === 'left' && 'items-start pl-2',
              isDown(key.code) && 'scale-95 bg-accented shadow-none'
            ]"
            :style="{ flex: `${key.size ?? 1} 1 0%` }"
          >
            <UIcon
              v-if="key.kind === 'touch'"
              :name="key.icon!"
              class="size-5 text-muted"
            />

            <template v-else-if="key.fn">
              <UIcon
                :name="key.icon!"
                class="size-3 text-muted"
              />
              <span class="mt-2 text-[7px] sm:text-[8px] leading-none text-dimmed">{{ key.fn }}</span>
            </template>

            <template v-else-if="key.icon">
              <UIcon
                :name="key.icon"
                class="size-3.5 text-muted"
              />
              <span
                v-if="key.label"
                class="mt-1 text-[7px] sm:text-[8px] leading-none text-dimmed"
              >
                {{ t(`keyboard.keys.${key.label}`) }}
              </span>
            </template>

            <span
              v-else-if="key.label"
              class="text-[10px] sm:text-[11px] text-muted"
            >
              {{ t(`keyboard.keys.${key.label}`) }}
            </span>

            <template v-else-if="key.main">
              <span
                v-if="key.top"
                class="text-[10px] sm:text-[11px] leading-none text-dimmed"
              >
                {{ key.top }}
              </span>
              <span
                class="text-sm sm:text-base"
                :class="key.top && 'leading-tight'"
              >
                {{ key.main }}
              </span>
            </template>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
