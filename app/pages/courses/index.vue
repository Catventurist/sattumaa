<script setup lang="ts">
definePageMeta({
  layout: 'learn'
})

const { t } = useI18n()
const { courses } = useCourses()
const { percent } = useProgress()

useSeoMeta({
  title: () => t('pages.courses.title'),
  description: () => t('pages.courses.description')
})
</script>

<template>
  <div class="h-full overflow-auto p-6">
    <h1 class="mb-6 text-xl font-semibold text-highlighted">
      {{ t('learning.menu.courses') }}
    </h1>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="course in courses"
        :key="course.slug"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              :name="course.icon"
              class="size-5 text-info"
            />
            <span class="font-medium text-highlighted">
              {{ t(`learning.courses.${course.slug}.title`) }}
            </span>
          </div>
        </template>

        <p class="text-sm text-muted">
          {{ t(`learning.courses.${course.slug}.description`) }}
        </p>

        <UProgress
          class="mt-3"
          :model-value="percent(course)"
          color="success"
          size="xs"
        />
        <template #footer>
          <UButton
            :to="`/courses/${course.slug}`"
            :label="t('learning.open')"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            variant="subtle"
          />
        </template>
      </UCard>
    </div>
  </div>
</template>
