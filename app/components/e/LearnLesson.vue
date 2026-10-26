<script setup lang="ts">
import type { Course, Lesson } from '~/composables/useCourses'

interface Props {
  course: Course
  lesson: Lesson
  notesHidden?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  showNotes: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { isDone, toggle } = useProgress()

const index = computed(() => props.course.lessons.findIndex(item => item.id === props.lesson.id))
const previous = computed(() => props.course.lessons[index.value - 1])
const following = computed(() => props.course.lessons[index.value + 1])
const done = computed(() => isDone(props.course.slug, props.lesson.id))

function lessonLink(id: string) {
  return localePath({ path: `/courses/${props.course.slug}`, query: { lesson: id } })
}
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-auto p-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <UBadge
        :color="done ? 'success' : 'info'"
        variant="subtle"
        :icon="done ? 'i-lucide-circle-check' : lesson.icon"
        :label="t('learning.lesson')"
      />
      <UButton
        v-if="notesHidden"
        icon="i-lucide-notebook-pen"
        color="neutral"
        variant="ghost"
        size="xs"
        :label="t('learning.showNotes')"
        @click="emit('showNotes')"
      />
    </div>

    <AnimatePresence mode="wait">
      <Motion
        :key="lesson.id"
        as="div"
        class="flex-1"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -8 }"
        :transition="{ duration: 0.2 }"
      >
        <h1 class="text-xl font-semibold text-highlighted">
          {{ t(`learning.courses.${course.slug}.lessons.${lesson.id}.title`) }}
        </h1>
        <p class="mt-2 text-muted">
          {{ t(`learning.courses.${course.slug}.lessons.${lesson.id}.body`) }}
        </p>
        <UButton
          class="mt-6"
          :icon="done ? 'i-lucide-undo-2' : 'i-lucide-check'"
          :label="done ? t('learning.undo') : t('learning.markDone')"
          :color="done ? 'neutral' : 'success'"
          variant="subtle"
          @click="toggle(course.slug, lesson.id)"
        />
      </Motion>
    </AnimatePresence>

    <div class="mt-6 flex items-center justify-between border-t border-default pt-4">
      <UButton
        v-if="previous"
        :to="lessonLink(previous.id)"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        :label="t('learning.previous')"
      />
      <span v-else />
      <UButton
        v-if="following"
        :to="lessonLink(following.id)"
        trailing-icon="i-lucide-arrow-right"
        color="neutral"
        variant="subtle"
        :label="t('learning.next')"
      />
    </div>
  </div>
</template>
