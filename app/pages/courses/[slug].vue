<script setup lang="ts">
definePageMeta({
  layout: 'learn'
})

const route = useRoute()
const { findCourse } = useCourses()
const { t } = useI18n()
const course = findCourse(String(route.params.slug))

if (!course) {
  throw createError({ status: 404, fatal: true })
}

useSeoMeta({
  title: () => t('pages.courses.title'),
  description: () => t('pages.courses.description')
})
</script>

<template>
  <div class="h-full">
    <ClientOnly>
      <ELearnSplitter
        :key="course.slug"
        :course="course"
      />
    </ClientOnly>
  </div>
</template>
