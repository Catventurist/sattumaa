<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'

definePageMeta({
  layout: 'learn'
})

const { t } = useI18n()
const localePath = useLocalePath()
const { courses } = useCourses()
const { doneCount, percent, nextLesson, reset } = useProgress()

const total = courses.reduce((sum, course) => sum + course.lessons.length, 0)
const totalDone = computed(() => courses.reduce((sum, course) => sum + doneCount(course), 0))
const overall = computed(() => Math.round(totalDone.value / total * 100))

function continueLink(slug: string, lessonId: string) {
  return localePath({ path: `/courses/${slug}`, query: { lesson: lessonId } })
}

const toast = useToast()
const { exportBackup, importBackup } = useBackup()

const { open: openDialog, onChange } = useFileDialog({
  accept: 'application/json',
  multiple: false
})

onChange(async (files) => {
  const file = files?.[0]

  if (!file) {
    return
  }

  const ok = await importBackup(file)

  toast.add({
    title: ok ? t('learning.progressPage.importDone') : t('learning.progressPage.importFailed'),
    icon: ok ? 'i-lucide-circle-check' : 'i-lucide-circle-alert',
    color: ok ? 'success' : 'error'
  })
})

useSeoMeta({
  title: () => t('learning.menu.progress'),
  description: () => t('learning.progressPage.notice')
})
</script>

<template>
  <div class="h-full overflow-auto p-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-highlighted">
        {{ t('learning.menu.progress') }}
      </h1>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-download"
          color="neutral"
          variant="subtle"
          :label="t('learning.progressPage.export')"
          @click="exportBackup()"
        />
        <UButton
          icon="i-lucide-upload"
          color="neutral"
          variant="subtle"
          :label="t('learning.progressPage.import')"
          @click="openDialog()"
        />
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          :label="t('learning.progressPage.reset')"
          :disabled="totalDone === 0"
          @click="reset()"
        />
      </div>
    </div>

    <UAlert
      class="mb-6"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :description="t('learning.progressPage.notice')"
    />

    <UCard class="mb-6">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium text-highlighted">
            {{ t('learning.progressPage.overall') }}
          </span>
          <span class="text-muted">
            {{ t('learning.progress', { done: totalDone, total }) }}
          </span>
        </div>
        <UProgress
          :model-value="overall"
          color="success"
        />
      </div>
    </UCard>

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

        <div class="flex flex-col gap-1.5">
          <UProgress
            :model-value="percent(course)"
            color="success"
            size="sm"
          />
          <p class="text-xs text-muted">
            {{ t('learning.progress', { done: doneCount(course), total: course.lessons.length }) }}
          </p>
        </div>

        <template #footer>
          <UButton
            :to="continueLink(course.slug, nextLesson(course).id)"
            :label="doneCount(course) === 0 ? t('learning.progressPage.start') : t('learning.progressPage.continue')"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            variant="subtle"
          />
        </template>
      </UCard>
    </div>
  </div>
</template>
