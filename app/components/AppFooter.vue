<script setup lang="ts">
const { footer } = useAppConfig()
const { t } = useI18n()
</script>

<template>
  <UFooter>
    <template #left>
      {{ footer.credits }}
    </template>

    <span class="text-sm text-muted">
      {{ t('site.policy') }}
    </span>

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
