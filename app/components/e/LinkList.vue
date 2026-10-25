<script setup lang="ts">
import type { ListboxItem } from '@nuxt/ui'
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{ bookmarks: Bookmark[] }>()

const { t } = useI18n()
const favorites = useLocalStorage<string[]>('favorites', [], {
  initOnMounted: true
})
const sourceSelection = ref<string[]>([])
const targetSelection = ref<string[]>([])

const bookmarkMap = computed(() => new Map(props.bookmarks.map(b => [b.to, b])))

const groups = computed<ListboxItem[][]>(() => {
  const byFolder = new Map<string, ListboxItem[]>()

  for (const b of props.bookmarks) {
    if (favorites.value.includes(b.to)) continue
    const folder = b.folder || t('bookmarks.unsorted')
    byFolder.set(folder, [
      ...(byFolder.get(folder) ?? []),
      { label: b.label, description: b.to, icon: 'i-lucide-bookmark', value: b.to }
    ])
  }

  return [...byFolder].map(([folder, items]) => [
    { type: 'label', label: folder },
    ...items
  ])
})

const favoriteItems = computed<ListboxItem[]>(() =>
  favorites.value
    .map(to => bookmarkMap.value.get(to))
    .filter((b): b is NonNullable<typeof b> => !!b)
    .map(b => ({ label: b.label, description: b.to, icon: 'i-lucide-bookmark', value: b.to }))
)

function addFavorites() {
  favorites.value = [...new Set([...favorites.value, ...sourceSelection.value])]
  sourceSelection.value = []
}

function removeFavorites() {
  favorites.value = favorites.value.filter(to => !targetSelection.value.includes(to))
  targetSelection.value = []
}
</script>

<template>
  <div class="flex items-stretch gap-4">
    <div class="flex flex-1 flex-col gap-1">
      <span class="text-sm font-medium text-highlighted">{{ t('bookmarks.available') }}</span>
      <UListbox
        v-model="sourceSelection"
        :items="groups"
        value-key="value"
        :filter="{ placeholder: t('bookmarks.search'), icon: 'i-lucide-search' }"
        :filter-fields="['label', 'description']"
        multiple
        class="h-96"
      >
        <template #empty>
          {{ t('bookmarks.emptySource') }}
        </template>
      </UListbox>
    </div>

    <div class="flex flex-col justify-center gap-1">
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="outline"
        :aria-label="t('bookmarks.add')"
        :disabled="!sourceSelection.length"
        @click="addFavorites"
      />
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="outline"
        :aria-label="t('bookmarks.remove')"
        :disabled="!targetSelection.length"
        @click="removeFavorites"
      />
    </div>

    <div class="flex flex-1 flex-col gap-1">
      <span class="text-sm font-medium text-highlighted">{{ t('bookmarks.favorites') }}</span>
      <UListbox
        v-model="targetSelection"
        :items="favoriteItems"
        value-key="value"
        :filter="{ placeholder: t('bookmarks.searchFavorites'), icon: 'i-lucide-search' }"
        multiple
        class="h-96"
      >
        <template #empty>
          {{ t('bookmarks.emptyFavorites') }}
        </template>
      </UListbox>
    </div>
  </div>
</template>
