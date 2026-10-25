<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { geoUrl, type GeoSite } from '~/composables/useWin'

interface Entry {
  id: string
  name: string
  text: string
  date: string
}

const props = defineProps<{
  site: GeoSite
}>()

const emit = defineEmits<{
  navigate: [url: string]
}>()

const { t, locale } = useI18n()

const entries = useLocalStorage<Entry[]>(`win:geo:guestbook:${props.site.id}`, [], { initOnMounted: true })
const name = ref('')
const message = ref('')

const seeds = computed<Entry[]>(() => [
  { id: 'seed1', name: t('geo.guestbook.seed1Name'), text: t('geo.guestbook.seed1Text'), date: '1999-03-14' },
  { id: 'seed2', name: t('geo.guestbook.seed2Name'), text: t('geo.guestbook.seed2Text'), date: '1999-11-02' }
])

const all = computed(() => [...entries.value, ...seeds.value])

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(value))
}

function submit() {
  if (!name.value.trim() || !message.value.trim()) return
  entries.value = [
    {
      id: crypto.randomUUID(),
      name: name.value.trim().slice(0, 30),
      text: message.value.trim().slice(0, 300),
      date: new Date().toISOString()
    },
    ...entries.value
  ].slice(0, 50)
  name.value = ''
  message.value = ''
}
</script>

<template>
  <div class="flex min-h-full flex-col gap-4 bg-default p-4">
    <h1 class="text-center text-2xl font-bold text-info">
      {{ t('geo.guestbook.title') }}
    </h1>

    <form
      class="space-y-2 rounded-sm border border-default bg-elevated/50 p-3"
      @submit.prevent="submit"
    >
      <UInput
        v-model="name"
        :placeholder="t('geo.guestbook.name')"
        :maxlength="30"
        class="w-full"
      />
      <UTextarea
        v-model="message"
        :placeholder="t('geo.guestbook.message')"
        :maxlength="300"
        :rows="3"
        class="w-full"
      />
      <UButton
        type="submit"
        icon="i-lucide-pen-line"
        :label="t('geo.guestbook.submit')"
        color="info"
      />
    </form>

    <ul class="space-y-2">
      <li
        v-for="entry in all"
        :key="entry.id"
        class="rounded-sm border border-default p-2"
      >
        <div class="flex justify-between text-xs text-muted">
          <span class="font-bold text-success">{{ entry.name }}</span>
          <span>{{ formatDate(entry.date) }}</span>
        </div>
        <p class="mt-1 text-sm">
          {{ entry.text }}
        </p>
      </li>
    </ul>

    <UButton
      icon="i-lucide-arrow-left"
      :label="t('geo.back')"
      color="neutral"
      variant="outline"
      class="self-start"
      @click="emit('navigate', geoUrl(site.path))"
    />
  </div>
</template>
