<script setup lang="ts">
import { GEO_SITES, geoUrl, type GeoSite } from '~/composables/useWin'

defineProps<{
  missing?: boolean
}>()

const emit = defineEmits<{
  navigate: [url: string]
}>()

const { t } = useI18n()

const hoods = computed(() => {
  const groups: Record<string, GeoSite[]> = {}
  for (const site of GEO_SITES) {
    const hood = site.path.split('/')[0]!
    groups[hood] = [...(groups[hood] ?? []), site]
  }
  return Object.entries(groups)
})
</script>

<template>
  <div class="flex min-h-full flex-col gap-4 bg-default p-4">
    <h1 class="text-center text-3xl font-bold text-secondary">
      {{ t('geo.directory.title') }}
    </h1>

    <UAlert
      v-if="missing"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :title="t('geo.directory.missing')"
    />
    <p v-else>
      {{ t('geo.directory.intro') }}
    </p>

    <section
      v-for="[hood, sites] in hoods"
      :key="hood"
    >
      <h2 class="mb-1 flex items-center gap-2 font-bold">
        <UIcon
          name="i-lucide-map-pin"
          class="size-4 text-info"
        />
        {{ hood }}
      </h2>
      <ul class="space-y-1">
        <li
          v-for="site in sites"
          :key="site.id"
        >
          <UButton
            :icon="site.icon"
            :label="t(`geo.sites.${site.id}.title`)"
            color="neutral"
            variant="link"
            @click="emit('navigate', geoUrl(site.path))"
          />
        </li>
      </ul>
    </section>
  </div>
</template>
