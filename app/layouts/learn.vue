<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarOpen = useState('sidebar-open', () => true)

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { courses } = useCourses()

const inCourses = computed(() => route.path.includes('/courses') && !route.path.endsWith('/courses/progress'))

const navItems = computed<NavigationMenuItem[]>(() => [
  { label: t('learning.menu.home'), icon: 'i-lucide-home', to: localePath('/') },
  {
    label: t('learning.menu.courses'),
    icon: 'i-lucide-book-open',
    to: localePath('/courses'),
    active: inCourses.value,
    defaultOpen: inCourses.value,
    children: courses.map(course => ({
      label: t(`learning.courses.${course.slug}.title`),
      icon: course.icon,
      to: localePath(`/courses/${course.slug}`)
    }))
  },
  { label: t('learning.menu.progress'), icon: 'i-lucide-chart-line', to: localePath('/courses/progress') }
  /* { label: t('learning.menu.settings'), icon: 'i-lucide-settings', to: localePath('/settings') } */
])
</script>

<template>
  <div class="flex h-screen">
    <USidebar
      v-model:open="sidebarOpen"
      collapsible="icon"
      rail
      :ui="{ container: 'h-full' }"
    >
      <template #default="{ state }">
        <UNavigationMenu
          :key="state"
          :items="navItems"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
        <LocaleSel />
      </template>
    </USidebar>

    <div class="flex flex-1 min-w-0 flex-col">
      <div class="flex h-(--ui-header-height) shrink-0 items-center border-b border-default px-4">
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          :aria-label="t('learning.menu.toggle')"
          @click="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div class="relative flex-1 min-h-0">
        <slot />
      </div>
    </div>
  </div>
</template>
