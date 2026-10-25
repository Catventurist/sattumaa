<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const docsNavigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContainer>
    <LazyAppHeader />
    <UMain>
      <UPage>
        <template #left>
          <UPageAside>
            <LazyUContentNavigation
              highlight
              :navigation="docsNavigation"
            />
          </UPageAside>
        </template>

        <slot />
      </UPage>
    </UMain>
  </UContainer>
</template>
