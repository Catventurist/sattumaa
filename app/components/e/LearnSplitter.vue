<script setup lang="ts">
import type { SplitterItem, TabsItem } from '@nuxt/ui'
import type { Course } from '~/composables/useCourses'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  course: Course
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const isDesktop = useMediaQuery('(min-width: 768px)')

const notesOpen = ref(true)
const tab = ref('lesson')

const firstLesson = props.course.lessons[0]

const current = computed(() => props.course.lessons.find(lesson => lesson.id === route.query.lesson) ?? firstLesson)

const notesStore = useState<Record<string, string>>('learning-notes', () => ({}))
const notesKey = computed(() => `${props.course.slug}:${current.value.id}`)

const notes = computed({
  get: () => notesStore.value[notesKey.value] ?? '',
  set: (value: string) => {
    notesStore.value = { ...notesStore.value, [notesKey.value]: value }
  }
})

const courseTitle = computed(() => t(`learning.courses.${props.course.slug}.title`))
const lessonTitle = computed(() => t(`learning.courses.${props.course.slug}.lessons.${current.value.id}.title`))
const lessonBody = computed(() => t(`learning.courses.${props.course.slug}.lessons.${current.value.id}.body`))

useSeoMeta({
  title: () => `${lessonTitle.value} - ${courseTitle.value}`,
  description: () => lessonBody.value,
  ogTitle: () => `${lessonTitle.value} - ${courseTitle.value}`,
  ogDescription: () => lessonBody.value
})

watch(() => current.value.id, () => {
  tab.value = 'lesson'
})

const splitterItems = computed<SplitterItem[]>(() => {
  const base: SplitterItem[] = [
    {
      id: 'sections',
      slot: 'sections',
      order: 1,
      minSize: 15,
      maxSize: 30,
      defaultSize: 20,
      class: 'bg-elevated/25 border-r border-default'
    },
    {
      id: 'lesson',
      slot: 'lesson',
      order: 2,
      minSize: 30,
      defaultSize: notesOpen.value ? 55 : 80,
      class: 'bg-default'
    }
  ]

  if (!notesOpen.value) {
    return base
  }

  return [
    ...base,
    {
      id: 'notes',
      slot: 'notes',
      order: 3,
      minSize: 15,
      maxSize: 35,
      defaultSize: 25,
      class: 'bg-elevated/25 border-l border-default'
    }
  ]
})

const tabItems = computed<TabsItem[]>(() => [
  { label: t('learning.sections'), icon: 'i-lucide-list', value: 'sections', slot: 'sections' },
  { label: t('learning.lesson'), icon: 'i-lucide-book-open', value: 'lesson', slot: 'lesson' },
  { label: t('learning.notes'), icon: 'i-lucide-notebook-pen', value: 'notes', slot: 'notes' }
])
</script>

<template>
  <USplitter
    v-if="isDesktop"
    id="learning-splitter"
    :items="splitterItems"
    :ui="{ handle: 'data-[orientation=horizontal]:w-px bg-border transition-colors data-[state=hover]:bg-info/50 data-[state=drag]:bg-info' }"
  >
    <template #sections>
      <ELearnSections
        :course="course"
        :current-id="current.id"
      />
    </template>

    <template #lesson>
      <ELearnLesson
        :course="course"
        :lesson="current"
        :notes-hidden="!notesOpen"
        @show-notes="notesOpen = true"
      />
    </template>

    <template #notes>
      <ELearnNotes
        v-model="notes"
        hideable
        @hide="notesOpen = false"
      />
    </template>
  </USplitter>

  <UTabs
    v-else
    v-model="tab"
    :items="tabItems"
    :content="true"
    class="h-full"
    :ui="{ root: 'h-full gap-0', list: 'rounded-none', content: 'flex-1 min-h-0 overflow-auto' }"
  >
    <template #sections>
      <ELearnSections
        :course="course"
        :current-id="current.id"
      />
    </template>

    <template #lesson>
      <ELearnLesson
        :course="course"
        :lesson="current"
      />
    </template>

    <template #notes>
      <ELearnNotes v-model="notes" />
    </template>
  </UTabs>
</template>
