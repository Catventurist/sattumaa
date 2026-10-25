<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { Motion } from 'motion-v'
import { startApp } from '~/composables/useWin'

type Color = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type Action = 'favorite' | 'pin'
type GroupItem = NavigationMenuItem & { children: NavigationMenuItem[] }

const asGroup = (item: unknown) => item as GroupItem

const props = withDefaults(defineProps<{
  mode?: 'popover' | 'tabbar'
  color?: Color
  variant?: 'pill' | 'link'
  highlight?: boolean
  type?: 'single' | 'multiple'
  side?: 'top' | 'bottom' | 'left' | 'right'
  fixed?: boolean
  children?: boolean
  actions?: Action[]
}>(), {
  mode: 'popover',
  color: 'info',
  variant: 'pill',
  highlight: false,
  type: 'single',
  side: 'top',
  fixed: false,
  children: true,
  actions: () => ['favorite', 'pin']
})

const emit = defineEmits<{ select: [key: string] }>()
const open = defineModel<boolean>('open', { default: false })
const favorites = defineModel<string[]>('favorites', { default: () => [] })
const pinned = defineModel<string[]>('pinned', { default: () => [] })

const { t } = useI18n()

const headerBg: Record<Color, string> = {
  primary: 'bg-primary/90',
  secondary: 'bg-secondary/90',
  success: 'bg-success/90',
  info: 'bg-info/90',
  warning: 'bg-warning/90',
  error: 'bg-error/90',
  neutral: 'bg-inverted/90'
}

function pick(key: string) {
  emit('select', key)
  open.value = false
}

function toggle(model: Ref<string[]>, key: string) {
  model.value = model.value.includes(key)
    ? model.value.filter(k => k !== key)
    : [...model.value, key]
}

const toggleFavorite = (key: string) => toggle(favorites, key)
const togglePin = (key: string) => toggle(pinned, key)

function actionable(value: unknown): value is string {
  return typeof value === 'string' && value in START_APPS && value !== 'shutDown' && props.actions.length > 0
}

function leaf(key: string): NavigationMenuItem {
  const app = startApp(key)
  return { label: t(app.label), icon: app.icon, value: key, onSelect: () => pick(key) }
}

const groups = computed<NavigationMenuItem[][]>(() => {
  const favoriteKeys = favorites.value.filter(key => key in START_APPS)
  const favoriteGroup: NavigationMenuItem[][] = favoriteKeys.length
    ? [[{ label: t('taskbar.menu.favorites'), type: 'label' }, ...favoriteKeys.map(leaf)]]
    : []

  return [
    ...favoriteGroup,
    [
      { label: t('taskbar.menu.programs'), type: 'label' },
      leaf('browser'),
      leaf('media'),
      leaf('board'),
      leaf('clock'),
      leaf('paint'),
      leaf('notes'),
      leaf('sheet')
    ],
    [
      {
        label: t('taskbar.apps.community'),
        icon: 'i-lucide-users',
        children: [leaf('communication'), leaf('messages'), leaf('jitsi'), leaf('kiosk')]
      }
    ],
    [
      { label: t('taskbar.menu.places'), type: 'label' },
      {
        label: t('taskbar.apps.documents'),
        icon: 'i-lucide-folder',
        value: 'documents',
        children: [leaf('explorer'), leaf('pictures'), leaf('music')]
      },
      leaf('settings')
    ],
    [leaf('shutDown')]
  ]
})

const tabs = computed<NavigationMenuItem[]>(() =>
  groups.value
    .flat()
    .filter(item => item.type !== 'label')
    .map(item =>
      item.children?.length && props.children
        ? { ...item, slot: 'group' }
        : { ...item, children: undefined }
    )
)

function selectChild(child: NavigationMenuItem) {
  child.onSelect?.(new Event('select'))
}

const { settings } = useSettings()
const menuMode = computed(() => settings.value.startMenuMode)
watch(menuMode, () => {
  open.value = false
})
</script>

<template>
  <UPopover
    v-if="mode === 'popover'"
    v-model:open="open"
    :content="{ side, align: 'start', sideOffset: 0 }"
    :ui="{ content: 'w-72 p-0 rounded-none rounded-tr-lg overflow-hidden ring-0 border border-inverted/40 bg-default/80 backdrop-blur-md' }"
  >
    <slot>
      <UButton
        icon="i-lucide-layout-grid"
        :label="t('taskbar.start')"
        :color="color"
      />
    </slot>

    <template #content>
      <Motion
        as="div"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.15 }"
      >
        <div
          :class="[
            'flex items-center gap-2 bg-linear-to-b from-default/20 to-transparent px-3 py-2',
            headerBg[color]
          ]"
        >
          <UAvatar
            icon="i-lucide-user"
            size="lg"
            class="bg-default"
          />
          <span class="font-bold text-inverted">{{ t('taskbar.user') }}</span>
        </div>

        <UNavigationMenu
          orientation="vertical"
          :items="groups"
          :color="color"
          :variant="variant"
          :highlight="highlight"
          :type="type"
          :ui="{ link: 'text-xs', label: 'text-xs' }"
          class="p-1"
        >
          <template #item-trailing="{ item }">
            <slot
              name="item-trailing"
              :item="item"
              :favorite="favorites.includes(String(item.value))"
              :pinned="pinned.includes(String(item.value))"
              :toggle-favorite="() => toggleFavorite(String(item.value))"
              :toggle-pin="() => togglePin(String(item.value))"
            >
              <span
                v-if="actionable(item.value)"
                class="ms-auto flex items-center"
              >
                <UButton
                  v-if="actions.includes('favorite')"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="opacity-40"
                  square
                  :icon="favorites.includes(item.value) ? 'i-lucide-star' : 'i-lucide-star-off'"
                  :aria-label="t(favorites.includes(item.value) ? 'taskbar.menu.unfavorite' : 'taskbar.menu.favorite')"
                  @click.stop.prevent="toggleFavorite(item.value)"
                />
                <UButton
                  v-if="actions.includes('pin')"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="opacity-60"
                  square
                  :icon="pinned.includes(item.value) ? 'i-lucide-pin-off' : 'i-lucide-pin'"
                  :aria-label="t(pinned.includes(item.value) ? 'taskbar.menu.unpin' : 'taskbar.menu.pin')"
                  @click.stop.prevent="togglePin(item.value)"
                />
              </span>
              <UIcon
                v-else-if="item.children?.length"
                name="i-lucide-chevron-down"
                class="ms-auto"
              />
            </slot>
          </template>
        </UNavigationMenu>
      </Motion>
    </template>
  </UPopover>

  <Motion
    v-else
    as="nav"
    :initial="fixed ? { y: '100%' } : false"
    :animate="{ y: '0%' }"
    :transition="{ type: 'spring', stiffness: 400, damping: 36 }"
    :class="[
      'border-t border-default bg-default/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md',
      fixed ? 'fixed inset-x-0 bottom-0 z-50' : 'relative w-full'
    ]"
  >
    <UNavigationMenu
      :items="tabs"
      :color="color"
      variant="link"
      :highlight="highlight"
      :ui="{
        root: 'w-full',
        list: 'w-full justify-around',
        item: 'flex-1',
        link: 'flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[10px]',
        linkLeadingIcon: 'size-5',
        linkLabel: 'truncate'
      }"
    >
      <template #group="{ item }">
        <UPopover
          :content="{ side: 'top', sideOffset: 8 }"
          :ui="{ content: 'w-48 p-1' }"
        >
          <UButton
            :icon="asGroup(item).icon"
            :label="asGroup(item).label"
            color="neutral"
            variant="ghost"
            class="w-full flex-col gap-0.5 px-2 py-1.5 text-[10px]"
          />
          <template #content>
            <UButton
              v-for="child in asGroup(item).children"
              :key="String(child.value)"
              :icon="child.icon"
              :label="child.label"
              block
              color="neutral"
              variant="ghost"
              size="sm"
              class="justify-start"
              @click="selectChild(child)"
            />
          </template>
        </UPopover>
      </template>
    </UNavigationMenu>
  </Motion>
</template>
