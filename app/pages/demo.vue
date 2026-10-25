<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const active = computed({
  get: () => (route.query.tab as string) || 'home',
  set: (value: string) => {
    router.replace({
      query: { ...route.query, tab: value === 'home' ? undefined : value }
    })
  }
})

const tabs = computed(() => [
  { label: t('demo.tabs.home'), icon: 'i-lucide-house', value: 'home', slot: 'home' as const },
  { label: t('demo.tabs.chart'), icon: 'i-lucide-area-chart', value: 'chart', slot: 'chart' as const },
  { label: t('demo.tabs.workflow'), icon: 'i-lucide-workflow', value: 'workflow', slot: 'workflow' as const },
  { label: t('demo.tabs.persona'), icon: 'i-lucide-users', value: 'persona', slot: 'persona' as const },
  { label: t('demo.tabs.profile'), icon: 'i-lucide-id-card', value: 'profile', slot: 'profile' as const },
  { label: t('demo.tabs.various'), icon: 'i-lucide-component', value: 'various', slot: 'various' as const }
])

const tabUi = {
  content: 'data-[state=active]:animate-tab-in motion-reduce:animate-none'
}

const step = 'animate-tab-in motion-reduce:animate-none [animation-fill-mode:backwards]'
const heroUi = {
  headline: `${step} [animation-delay:0ms]`,
  title: `${step} [animation-delay:100ms] text-primary`,
  description: `${step} [animation-delay:200ms]`,
  body: `${step} [animation-delay:300ms]`,
  container: 'py-0 sm:py-0 lg:py-12'
}

const cards = computed(() => [
  {
    key: 'chart',
    icon: 'i-lucide-area-chart',
    color: 'success' as const,
    iconClass: 'text-success',
    to: { query: { tab: 'chart' } }
  },
  {
    key: 'workflow',
    icon: 'i-lucide-workflow',
    color: 'primary' as const,
    iconClass: 'text-primary',
    to: { query: { tab: 'workflow' } }
  },
  {
    key: 'persona',
    icon: 'i-lucide-users',
    color: 'info' as const,
    iconClass: 'text-info',
    to: { query: { tab: 'persona' } }
  },
  {
    key: 'profile',
    icon: 'i-lucide-id-card',
    color: 'warning' as const,
    iconClass: 'text-warning',
    to: { query: { tab: 'profile' } }
  },
  {
    key: 'various',
    icon: 'i-lucide-component',
    color: 'error' as const,
    iconClass: 'text-error',
    to: { query: { tab: 'various' } }
  },
  {
    key: 'tools',
    icon: 'i-lucide-wrench',
    color: 'success' as const,
    iconClass: 'text-success',
    to: { query: { tab: 'tools' } }
  }
].map(card => ({
  ...card,
  title: t(`demo.hero.cards.${card.key}.title`),
  description: t(`demo.hero.cards.${card.key}.description`)
})))

useSeoMeta({
  title: () => t('pages.demo.title'),
  description: () => t('pages.demo.description'),
  ogTitle: () => t('pages.demo.title'),
  ogDescription: () => t('pages.demo.description')
})
</script>

<template>
  <div class="mx-auto px-4">
    <UTabs
      v-model="active"
      :items="tabs"
      :unmount-on-hide="false"
      :ui="tabUi"
      class="w-full"
    >
      <template #home>
        <UPageHero
          :title="t('demo.hero.title')"
          :description="t('demo.hero.description')"
          :ui="heroUi"
          class=""
        >
          <UPageGrid :ui="{ base: 'sm:grid-cols-2 lg:grid-cols-4' }">
            <UPageCard
              v-for="card in cards"
              :key="card.key"
              :icon="card.icon"
              :title="card.title"
              :description="card.description"
              :to="card.to"
              :spotlight="true"
              :spotlight-color="card.color"
              :highlight-color="card.color"
              :ui="{ leadingIcon: card.iconClass }"
            />
          </UPageGrid>
        </UPageHero>
      </template>

      <template #chart>
        <LazyChartDemo />
      </template>

      <template #workflow>
        <LazyEWorkflowBuilder />
      </template>

      <template #persona>
        <LazyEPersonaShowcase />
      </template>

      <template #profile>
        <LazyEProfileSettings />
      </template>

      <template #various>
        <LazySVariousExamples />
      </template>
    </UTabs>
  </div>
</template>
