<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const active = computed({
  get: () => (route.query.sub as string) || 'inputs',
  set: (value: string) => {
    router.replace({
      query: { ...route.query, sub: value === 'inputs' ? undefined : value }
    })
  }
})

const groups = computed(() => [
  { label: t('demo.various.inputs'), icon: 'i-lucide-sliders-horizontal', value: 'inputs', slot: 'inputs' as const },
  { label: t('demo.various.controls'), icon: 'i-lucide-mouse-pointer-click', value: 'controls', slot: 'controls' as const },
  { label: t('demo.various.motion'), icon: 'i-lucide-move', value: 'motion', slot: 'motion' as const },
  { label: t('demo.various.showcase'), icon: 'i-lucide-sparkles', value: 'showcase', slot: 'showcase' as const },
  { label: t('demo.various.tools'), icon: 'i-lucide-wrench', value: 'tools', slot: 'tools' as const },
  { label: t('demo.various.crypto'), icon: 'i-lucide-shield-cog-corner', value: 'crypto', slot: 'crypto' as const }
])

const tabUi = {
  content: 'data-[state=active]:animate-tab-in motion-reduce:animate-none'
}

const cell = 'grid grid-cols-1 items-center gap-6 pt-6 md:grid-cols-3 *:justify-center *:rounded-2xl'
</script>

<template>
  <UTabs
    v-model="active"
    :items="groups"
    variant="link"
    :ui="tabUi"
    class="w-full"
  >
    <template #inputs>
      <div :class="cell">
        <LazySWarmRatingMain />
        <LazySWarmDialMain />
        <LazySPinSlotsMain />
        <LazySWarmCheckMain />
        <LazySSwipeMain />
        <LazySBranchMenuMain class="max-h-100" />
      </div>
    </template>

    <template #controls>
      <div class="flex flex-col space-y-8">
        <LazySBureaucracyChat />
        <LazySFileControlsMain />
        <LazySSchrodingerPlatform />
        <LazySLocKeyboard />
        <!-- <LazyELinkList :bookmarks="mockBookmarks" /> id -->
      </div>
    </template>

    <template #motion>
      <div :class="cell">
        <LazySWarmSlider />
        <LazySRefineFrameMain class="self-center" />
        <LazySWarmTooltipMain />
        <LazySSlinger class="md:ms-30" />
        <LazySApertureButton
          :label="t('demo.various.motion')"
          icon="i-lucide-move"
          class="md:ms-20"
        />
        <LazySShapeDrawMain />
      </div>
    </template>

    <template #showcase>
      <div class="flex flex-col">
        <LazySImageSpiralMain />
        <LazySScrollExpandMain />
      </div>
    </template>

    <template #tools>
      <div class="flex flex-col space-y-8">
        <LazyMMiniResume />
        <LazyMTaskCard />
        <LazyMBrandBuild />
        <LazySMoodTracker />
      </div>
    </template>

    <template #crypto>
      <div class="flex flex-col space-y-8">
        <LazySTotpVault />
      </div>
    </template>
  </UTabs>
</template>
