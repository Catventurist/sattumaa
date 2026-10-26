<script setup lang="ts">
interface Perk { label: string, description: string, infers: string }

const props = withDefaults(defineProps<{
  title?: string
  knownTitle?: string
  empty?: string
  denial?: string
  moods?: string[]
  perks?: Perk[]
}>(), {
  title: 'Make your life easier',
  knownTitle: 'What we know about you',
  empty: 'Nothing yet. Try a switch.',
  denial: 'We do not score you. We just have facts.',
  moods: () => ['Unknown', 'Familiar', 'Well understood', 'Predictable', 'Fully legible'],
  perks: () => [
    { label: 'Faster routes', description: 'Share your location', infers: 'Home, workplace, daily routine' },
    { label: 'Find friends', description: 'Sync your contacts', infers: 'Social circle, who you trust' },
    { label: 'Wellness tips', description: 'Connect health data', infers: 'Conditions, sleep, stress' },
    { label: 'Smart savings', description: 'Link your bank', infers: 'Income, habits, reliability' }
  ]
})

const state = ref<boolean[]>(props.perks.map(() => false))
const active = computed(() => props.perks.filter((_, i) => state.value[i]))
const level = computed(() => Math.min(active.value.length, 4))
const mood = computed(() => props.moods[Math.min(level.value, props.moods.length - 1)])

const themes = [
  { wrap: 'rounded-3xl bg-primary/10', card: 'rounded-2xl', variant: 'soft', badge: 'neutral', title: 'font-semibold text-default' },
  { wrap: 'rounded-2xl bg-info/10', card: 'rounded-xl', variant: 'soft', badge: 'info', title: 'font-semibold text-info' },
  { wrap: 'rounded-lg bg-accented', card: 'rounded-md', variant: 'subtle', badge: 'warning', title: 'font-medium tracking-wide text-warning' },
  { wrap: 'rounded-none bg-elevated', card: 'rounded-sm', variant: 'subtle', badge: 'warning', title: 'uppercase tracking-widest text-sm text-warning' },
  { wrap: 'rounded-none bg-error/10', card: 'rounded-none', variant: 'outline', badge: 'error', title: 'uppercase tracking-widest text-sm text-error' }
] as const

const theme = computed(() => themes[level.value]!)
</script>

<template>
  <div
    class="my-6 grid gap-4 p-4 md:grid-cols-2 transition-all duration-600"
    :class="theme.wrap"
  >
    <UCard
      :variant="theme.variant"
      :ui="{ root: theme.card }"
    >
      <template #header>
        <h3 :class="theme.title">
          {{ title }}
        </h3>
      </template>
      <div class="space-y-4">
        <USwitch
          v-for="(p, i) in perks"
          :key="p.label"
          v-model="state[i]"
          :label="p.label"
          :description="p.description"
          :color="level > 2 ? 'error' : 'success'"
        />
      </div>
    </UCard>

    <UCard
      :variant="theme.variant"
      :ui="{ root: theme.card }"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h3 :class="theme.title">
            {{ knownTitle }}
          </h3>
          <UBadge
            :color="theme.badge"
            variant="subtle"
          >
            {{ mood }}
          </UBadge>
        </div>
      </template>

      <ul class="space-y-2 min-h-24">
        <AnimatePresence>
          <Motion
            v-for="p in active"
            :key="p.label"
            as="li"
            class="flex gap-2 text-sm"
            :initial="{ opacity: 0, x: -12 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 12 }"
          >
            <UIcon
              name="i-lucide-eye"
              class="mt-0.5 shrink-0"
            />
            {{ p.infers }}
          </Motion>
        </AnimatePresence>
        <li
          v-if="!active.length"
          class="text-sm text-muted"
        >
          {{ empty }}
        </li>
      </ul>

      <AnimatePresence>
        <Motion
          v-if="active.length > 1"
          as="div"
          class="mt-4"
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0 }"
        >
          <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-smile"
            :title="denial"
          />
        </Motion>
      </AnimatePresence>
    </UCard>
  </div>
</template>
