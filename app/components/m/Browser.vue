<script setup lang="ts">
import { Motion, AnimatePresence } from 'motion-v'
import { geoUrl, normalizeGeoUrl, resolveGeo } from '~/composables/useWin'

interface BrowserTab {
  id: string
  stack: string[]
  index: number
}

const PAGES = {
  'mock://home': { title: 'browser.pages.home.title', icon: 'i-lucide-house' },
  'mock://docs': { title: 'browser.pages.docs.title', icon: 'i-lucide-book-open' },
  'mock://404': { title: 'browser.pages.notFound.title', icon: 'i-lucide-triangle-alert' }
} as const

type PageUrl = keyof typeof PAGES

const props = withDefaults(defineProps<{
  initialUrl?: PageUrl
  constraints?: HTMLElement | null
}>(), {
  initialUrl: 'mock://home',
  constraints: null
})

const emit = defineEmits<{ minimize: [], close: [] }>()
const open = defineModel<boolean>('open', { default: true })

const { t } = useI18n()

let seq = 0
const createTab = (url: string): BrowserTab => ({ id: `tab-${++seq}`, stack: [url], index: 0 })

const tabs = ref<BrowserTab[]>([createTab(props.initialUrl)])
const activeId = ref(tabs.value[0]!.id)
const loading = ref(false)
const address = ref('')

const active = computed(() => tabs.value.find(tab => tab.id === activeId.value)!)
const currentUrl = computed(() => active.value.stack[active.value.index]!)
const geo = computed(() => resolveGeo(currentUrl.value))
function pageOf(url: string) {
  const route = resolveGeo(url)
  if (!route) return PAGES[(url in PAGES ? url : 'mock://404') as PageUrl]
  if (route.kind === 'page') return { title: `geo.sites.${route.site.id}.title`, icon: route.site.icon }
  if (route.kind === 'guestbook') return { title: 'geo.guestbook.title', icon: 'i-lucide-book-open' }
  return { title: 'geo.directory.title', icon: 'i-lucide-map-pin' }
}

const canGoBack = computed(() => active.value.index > 0)
const canGoForward = computed(() => active.value.index < active.value.stack.length - 1)

const tabItems = computed(() =>
  tabs.value.map((tab) => {
    const page = pageOf(tab.stack[tab.index]!)
    return { value: tab.id, label: t(page.title), icon: page.icon }
  })
)

let loadTimer: ReturnType<typeof setTimeout> | undefined

function delayFor(url: string) {
  return resolveGeo(url) ? 1800 : 450
}

function load(delay = 450) {
  loading.value = true
  clearTimeout(loadTimer)
  loadTimer = setTimeout(() => {
    loading.value = false
  }, delay)
}

function navigate(raw: string) {
  const url = raw.trim()
  const target = resolveGeo(url) ? normalizeGeoUrl(url) : url
  const tab = active.value
  tab.stack = [...tab.stack.slice(0, tab.index + 1), target]
  tab.index = tab.stack.length - 1
  load(delayFor(target))
}

function back() {
  if (!canGoBack.value) return
  active.value.index--
  load(delayFor(currentUrl.value))
}

function forward() {
  if (!canGoForward.value) return
  active.value.index++
  load(delayFor(currentUrl.value))
}

function addTab() {
  const tab = createTab('mock://home')
  tabs.value.push(tab)
  activeId.value = tab.id
  load()
}

function closeTab(id: string) {
  if (tabs.value.length === 1) {
    emit('close')
    open.value = false
    return
  }
  const i = tabs.value.findIndex(tab => tab.id === id)
  tabs.value.splice(i, 1)
  if (activeId.value === id) {
    activeId.value = tabs.value[Math.max(0, i - 1)]!.id
  }
}

watch(currentUrl, (url) => {
  address.value = url
}, { immediate: true })

watch(open, (isOpen) => {
  if (!isOpen) {
    tabs.value = [createTab(props.initialUrl)]
    activeId.value = tabs.value[0]!.id
  }
})

onMounted(() => load())
onBeforeUnmount(() => clearTimeout(loadTimer))
</script>

<template>
  <MWindow
    :open="open"
    :title="t(pageOf(currentUrl).title)"
    :icon="pageOf(currentUrl).icon"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <UTabs
      v-model="activeId"
      :items="tabItems"
      :content="false"
      variant="link"
      size="xs"
      color="neutral"
      :ui="{ list: 'border-b border-default' }"
    >
      <template #trailing="{ item }">
        <span
          role="button"
          tabindex="0"
          class="rounded p-0.5 hover:bg-elevated"
          :aria-label="t('browser.closeTab')"
          @click.stop="closeTab(item.value as string)"
          @keydown.enter.stop="closeTab(item.value as string)"
        >
          <UIcon
            name="i-lucide-x"
            class="size-3"
          />
        </span>
      </template>
      <template #list-trailing>
        <UButton
          icon="i-lucide-plus"
          size="xs"
          square
          color="neutral"
          variant="ghost"
          :aria-label="t('browser.newTab')"
          @click="addTab"
        />
      </template>
    </UTabs>

    <div class="flex items-center gap-1 border-b border-default bg-elevated/50 p-1.5">
      <UButton
        icon="i-lucide-arrow-left"
        size="xs"
        square
        color="neutral"
        variant="ghost"
        :disabled="!canGoBack"
        :aria-label="t('browser.back')"
        @click="back"
      />
      <UButton
        icon="i-lucide-arrow-right"
        size="xs"
        square
        color="neutral"
        variant="ghost"
        :disabled="!canGoForward"
        :aria-label="t('browser.forward')"
        @click="forward"
      />
      <UButton
        icon="i-lucide-rotate-cw"
        size="xs"
        square
        color="neutral"
        variant="ghost"
        :aria-label="t('browser.reload')"
        @click="load()"
      />
      <UInput
        v-model="address"
        name="address"
        size="xs"
        class="flex-1"
        icon="i-lucide-lock"
        :aria-label="t('browser.address')"
        @keydown.enter="navigate(address)"
      />
    </div>

    <UProgress
      v-if="loading"
      :model-value="null"
      size="2xs"
    />
    <div
      v-else
      class="h-0.5"
    />

    <div class="relative flex-1 overflow-auto">
      <AnimatePresence mode="wait">
        <Motion
          :key="`${activeId}-${active.index}-${currentUrl}`"
          as="div"
          :class="[geo ? '' : 'p-6', loading && geo ? 'opacity-40' : '']"
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.15 }"
        >
          <template v-if="geo">
            <MGeoPage
              v-if="geo.kind === 'page'"
              :site="geo.site"
              @navigate="navigate"
            />
            <MGeoGuestbook
              v-else-if="geo.kind === 'guestbook'"
              :site="geo.site"
              @navigate="navigate"
            />
            <MGeoDirectory
              v-else
              :missing="geo.kind === 'missing'"
              @navigate="navigate"
            />
          </template>
          <div
            v-else-if="currentUrl === 'mock://home'"
            class="mx-auto max-w-md space-y-4 text-center"
          >
            <h1 class="text-xl font-bold">
              {{ t('browser.pages.home.heading') }}
            </h1>
            <p class="text-sm text-muted">
              {{ t('browser.pages.home.subtitle') }}
            </p>
            <UInput
              name="search"
              class="w-full"
              icon="i-lucide-search"
              :placeholder="t('browser.pages.home.search')"
              @keydown.enter="navigate(($event.target as HTMLInputElement).value)"
            />
            <div class="flex justify-center gap-2">
              <UButton
                icon="i-lucide-book-open"
                :label="t('browser.pages.home.docs')"
                color="info"
                variant="soft"
                @click="navigate('mock://docs')"
              />
              <UButton
                icon="i-lucide-map-pin"
                :label="t('geo.directory.title')"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="navigate(geoUrl())"
              />
              <UButton
                icon="i-lucide-triangle-alert"
                :label="t('browser.pages.home.notFound')"
                color="neutral"
                variant="soft"
                @click="navigate('mock://missing')"
              />
            </div>
          </div>
          <div
            v-else-if="currentUrl === 'mock://docs'"
            class="space-y-3"
          >
            <h1 class="text-xl font-bold">
              {{ t('browser.pages.docs.heading') }}
            </h1>
            <p class="text-sm text-muted">
              {{ t('browser.pages.docs.body') }}
            </p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <UBadge
                  color="success"
                  variant="subtle"
                  icon="i-lucide-wrench"
                />
                {{ t('browser.pages.docs.points') }}
              </li>
              <li class="flex items-center gap-2">
                <UBadge
                  color="info"
                  variant="subtle"
                  icon="i-lucide-vote"
                />
                {{ t('browser.pages.docs.votes') }}
              </li>
              <li class="flex items-center gap-2">
                <UBadge
                  color="warning"
                  variant="subtle"
                  icon="i-lucide-git-branch"
                />
                {{ t('browser.pages.docs.delegate') }}
              </li>
            </ul>
          </div>

          <UEmpty
            v-else
            icon="i-lucide-triangle-alert"
            :title="t('browser.pages.notFound.title')"
            :description="t('browser.pages.notFound.description')"
            :actions="[{ label: t('browser.pages.notFound.home'), icon: 'i-lucide-house', onClick: () => navigate('mock://home') }]"
          />
        </Motion>
      </AnimatePresence>
    </div>
  </MWindow>
</template>
