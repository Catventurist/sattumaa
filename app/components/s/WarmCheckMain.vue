<script setup lang="ts">
interface Todo {
  id: number
  title: string
  done: boolean
}

const { t } = useI18n()

const todos = useState<Todo[]>('todos', () => [
  { id: 1, title: 'ship', done: false },
  { id: 2, title: 'review', done: true },
  { id: 3, title: 'deploy', done: false }
])

const remaining = computed(() => todos.value.filter(todo => !todo.done).length)
</script>

<template>
  <div class="w-full max-w-sm space-y-1">
    <SWarmCheck
      v-for="todo in todos"
      :key="todo.id"
      v-model="todo.done"
      :label="t(`todo.${todo.title}`)"
      class="w-full"
    />

    <p class="pt-2 text-sm text-muted">
      {{ t('todo.remaining', remaining) }}
    </p>
  </div>
</template>
