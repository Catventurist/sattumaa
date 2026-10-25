<script setup lang="ts">
interface PersonaConfig {
  cards: number
  labels: 'explicit' | 'icon'
  toolbar: boolean
  toast: boolean
  advanced: 'hidden' | 'visible'
  grid: string
  notifications: 'combined' | 'split'
}

const personas: Record<PersonaId, PersonaConfig> = {
  new: { cards: 4, labels: 'explicit', toolbar: true, toast: true, advanced: 'hidden', grid: 'grid-cols-2 gap-6', notifications: 'combined' },
  casual: { cards: 6, labels: 'explicit', toolbar: true, toast: false, advanced: 'hidden', grid: 'grid-cols-3 gap-4', notifications: 'combined' },
  power: { cards: 10, labels: 'icon', toolbar: false, toast: false, advanced: 'visible', grid: 'grid-cols-3 lg:grid-cols-4 gap-2', notifications: 'split' },
  catmin: { cards: 10, labels: 'explicit', toolbar: false, toast: true, advanced: 'visible', grid: 'grid-cols-3 lg:grid-cols-4 gap-3', notifications: 'split' }
}

const allCards = [
  { key: 'post', icon: 'i-lucide-square-pen' },
  { key: 'events', icon: 'i-lucide-calendar' },
  { key: 'files', icon: 'i-lucide-folder' },
  { key: 'team', icon: 'i-lucide-users' },
  { key: 'stats', icon: 'i-lucide-chart-bar' },
  { key: 'inbox', icon: 'i-lucide-inbox' },
  { key: 'tasks', icon: 'i-lucide-list-checks' },
  { key: 'notes', icon: 'i-lucide-notebook' },
  { key: 'links', icon: 'i-lucide-link' },
  { key: 'search', icon: 'i-lucide-search' }
]

const advanced = [
  { key: 'api', icon: 'i-lucide-key' },
  { key: 'webhooks', icon: 'i-lucide-webhook' },
  { key: 'audit', icon: 'i-lucide-scroll-text' }
]

const { t } = useI18n()
const toast = useToast()

const p = (key: string, params: Record<string, unknown> = {}, plural?: number) =>
  plural === undefined
    ? t(`persona.${key}`, params)
    : t(`persona.${key}`, params, plural)

const persona = usePersona()
const showMore = ref(false)
const { unread } = useNotifications()

const config = computed(() => personas[persona.value])
const explicit = computed(() => config.value.labels === 'explicit')

const tabs = computed(() =>
  (Object.keys(personas) as PersonaId[]).map(id => ({
    label: p(`names.${id}`),
    value: id
  }))
)

const cards = computed(() => allCards.slice(0, config.value.cards))
const advancedVisible = computed(() => config.value.advanced === 'visible' || showMore.value)

function notify() {
  if (unread.value > 0) {
    toast.add({
      title: p('notifications.toast', { count: unread.value }, unread.value),
      icon: 'i-lucide-bell'
    })
  }
}

watch(unread, (n, old) => {
  if (n > old && config.value.toast) notify()
})

watch(persona, () => {
  showMore.value = false
  if (config.value.toast) notify()
})

onMounted(() => {
  if (config.value.toast) notify()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <USelect
        v-model="persona"
        :items="tabs"
        class="w-64"
      />
      <ENotificationCenter />
    </div>

    <p
      v-if="unread === 0"
      class="text-sm text-muted"
    >
      {{ p('notifications.empty') }}
    </p>

    <p class="text-sm text-muted">
      {{ p('summary', { count: cards.length }, cards.length) }}
    </p>

    <TransitionGroup
      name="list"
      tag="div"
      class="grid"
      :class="config.grid"
    >
      <UCard
        v-for="card in cards"
        :key="card.key"
        :ui="{ body: explicit ? 'p-6' : 'p-2 sm:p-2' }"
      >
        <div
          v-if="explicit"
          class="flex flex-col items-center gap-3"
        >
          <UIcon
            :name="card.icon"
            class="size-8"
          />
          <span class="font-medium">{{ p(`cards.${card.key}`) }}</span>
        </div>
        <UTooltip
          v-else
          :text="p(`cards.${card.key}`)"
        >
          <div class="flex justify-center">
            <UIcon
              :name="card.icon"
              class="size-5"
            />
          </div>
        </UTooltip>
      </UCard>
    </TransitionGroup>

    <UCard>
      <div
        v-if="config.toolbar"
        class="mb-3 flex gap-1"
      >
        <UButton
          icon="i-lucide-bold"
          color="neutral"
          variant="ghost"
        />
        <UButton
          icon="i-lucide-italic"
          color="neutral"
          variant="ghost"
        />
        <UButton
          icon="i-lucide-list"
          color="neutral"
          variant="ghost"
        />
        <UButton
          icon="i-lucide-link"
          color="neutral"
          variant="ghost"
        />
        <UButton
          icon="i-lucide-image"
          color="neutral"
          variant="ghost"
        />
      </div>
      <UTextarea
        :id="p('editor.title')"
        :placeholder="p('editor.placeholder')"
        class="w-full"
      />
      <p
        v-if="!config.toolbar"
        class="mt-2 text-sm text-muted"
      >
        {{ p('editor.hint', { key: '⌘K', command: '/new' }) }}
      </p>
    </UCard>

    <div class="space-y-3">
      <UButton
        v-if="config.advanced === 'hidden'"
        :label="showMore ? p('advanced.less') : p('advanced.more')"
        :trailing-icon="showMore ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        color="neutral"
        variant="subtle"
        @click="showMore = !showMore"
      />
      <div
        v-if="advancedVisible"
        class="flex flex-wrap gap-2"
      >
        <UButton
          v-for="item in advanced"
          :key="item.key"
          :icon="item.icon"
          :label="p(`advanced.${item.key}`)"
          color="neutral"
          variant="outline"
        />
      </div>
    </div>
  </div>
</template>
