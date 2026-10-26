<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { Course } from '~/composables/useCourses'

interface Props {
  course: Course
  currentId: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()
const { isDone, doneCount, percent } = useProgress()

const items = computed<NavigationMenuItem[]>(() => props.course.lessons.map(lesson => ({
  label: t(`learning.courses.${props.course.slug}.lessons.${lesson.id}.title`),
  icon: isDone(props.course.slug, lesson.id) ? 'i-lucide-circle-check' : lesson.icon,
  active: lesson.id === props.currentId,
  to: localePath({ path: `/courses/${props.course.slug}`, query: { lesson: lesson.id } })
})))
</script>

<template>
  <div class="flex w-full flex-col gap-3 p-3">
    <p class="text-xs font-medium uppercase text-muted">
      {{ t('learning.sections') }}
    </p>
    <UNavigationMenu
      :items="items"
      orientation="vertical"
    />
    <div class="mt-2 flex flex-col gap-1.5">
      <UProgress
        :model-value="percent(course)"
        color="success"
        size="xs"
      />
      <p class="text-xs text-muted">
        {{ t('learning.progress', { done: doneCount(course), total: course.lessons.length }) }}
      </p>
    </div>
  </div>
</template>
