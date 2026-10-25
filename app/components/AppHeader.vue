<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import AppLogo from './AppLogo.vue'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1' }"
    :to="header?.to || '/'"
  >
    <UContentSearchButton
      v-if="header?.search"
      :collapsed="false"
      class="w-full"
    />

    <template #title>
      <AppLogo />
    </template>
    <!-- <template
      v-if="header?.logo?.dark || header?.logo?.light || header?.title"
      #title
    >
      <UColorModeImage
        v-if="header?.logo?.dark || header?.logo?.light"
        :light="header?.logo?.light!"
        :dark="header?.logo?.dark!"
        :alt="header?.logo?.alt"
        class="h-6 w-auto shrink-0"
      />

      <span v-else-if="header?.title">
        {{ header.title }}
      </span>
    </template>

    <template
      v-else
      #left
    >
      <NuxtLinkLocale
        :to="header?.to || '/'"
        class="focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
      >
        <UIcon
          name="i-lucide-cat"
          class="w-auto h-6 shrink-0"
        />
      </NuxtLinkLocale>
    </template> -->

    <template #right>
      <ClientOnly>
        <UContentSearchButton
          v-if="header?.search"
          class="lg:hidden"
        />
        <LocaleSel />
        <ColorModeButton v-if="header?.colorMode" />
        <template v-if="header?.links">
          <UButton
            v-for="(link, index) of header.links"
            :key="index"
            v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
          />
        </template>
      </ClientOnly>
    </template>

    <template #body>
      <LazyUContentNavigation
        highlight
        :navigation="navigation"
      />
    </template>
  </UHeader>
</template>
