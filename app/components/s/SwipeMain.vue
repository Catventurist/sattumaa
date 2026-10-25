<script setup lang="ts">
interface Item { id: number, title: string }

const { t } = useI18n()
const items = useState<Item[]>('swipe-items', () => [
  { id: 1, title: '1 >' },
  { id: 2, title: '2 >' },
  { id: 3, title: '3 >' }
])

const openId = ref<number | null>(null)

const rows = ref<{ reset: () => void }[]>([])

const actions = computed(() => [
  { id: 'delete', label: t('swipe.delete') },
  { id: 'archive', label: t('swipe.archive'), icon: 'i-lucide-archive', color: 'info' as const }
])

function onCommit(item: Item) {
  items.value = items.value.filter(i => i.id !== item.id)
  if (openId.value === item.id) openId.value = null
}
</script>

<template>
  <div>
    <SSwipeRow
      v-for="(item, index) in items"
      :key="item.id"
      :ref="el => (rows[index] = el as any)"
      class="mb-2"
      :actions="actions"
      :open="openId === item.id"
      @update:open="openId = $event ? item.id : (openId === item.id ? null : openId)"
      @commit="onCommit(item)"
    >
      {{ item.title }}
    </SSwipeRow>
  </div>
</template>
