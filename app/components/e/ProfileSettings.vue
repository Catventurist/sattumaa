<script setup lang="ts">
type Media = 'text' | 'image' | 'video' | 'mixed'
type Cadence = 'hourly' | 'daily' | 'weekly'
type Moderation = 'permissive' | 'balanced' | 'strict'
type Lang = 'en' | 'fi'

const { t, locale } = useI18n()
const p = (key: string, params: Record<string, unknown> = {}) => t(`profile.${key}`, params)

const defaults = () => ({
  formality: 0.7,
  mediaPreference: 'text' as Media,
  postingCadence: 'daily' as Cadence,
  moderationStyle: 'strict' as Moderation,
  language: locale.value as Lang,
  rep: { helpfulness: 0.8, consistency: 0.6, crossSpace: 0.4, moderation: 0.9 }
})

const profile = reactive(defaults())

const mediaItems = computed(() =>
  (['text', 'image', 'video', 'mixed'] as Media[]).map(v => ({ value: v, label: p(`media.${v}`) }))
)
const cadenceItems = computed(() =>
  (['hourly', 'daily', 'weekly'] as Cadence[]).map(v => ({ value: v, label: p(`cadence.${v}`) }))
)
const moderationItems = computed(() =>
  (['permissive', 'balanced', 'strict'] as Moderation[]).map(v => ({ value: v, label: p(`moderation.${v}`) }))
)

const languageItems = [
  { value: 'fi', label: 'Suomi' },
  { value: 'en', label: 'English' }
]

const tone = computed(() => {
  const f = profile.formality
  return p(`formality.tiers.${f < 0.34 ? 'casual' : f < 0.67 ? 'balanced' : 'formal'}`)
})

const fmtPercent = (v: number) =>
  new Intl.NumberFormat(locale.value, { style: 'percent' }).format(v)

const repKeys = ['helpfulness', 'consistency', 'crossSpace', 'moderation'] as const
const repColor = (v: number) => v >= 0.75 ? 'success' : v >= 0.5 ? 'info' : 'warning'

const overall = computed(() =>
  repKeys.reduce((sum, k) => sum + profile.rep[k], 0) / repKeys.length
)

function snapshot() {
  return [
    `formality: ${profile.formality}`,
    `media_preference: ${profile.mediaPreference}`,
    `posting_cadence: ${profile.postingCadence}`,
    `moderation_style: ${profile.moderationStyle}`,
    `language: ${profile.language}`,
    `rep: { helpfulness: ${profile.rep.helpfulness}, consistency: ${profile.rep.consistency}, cross-space: ${profile.rep.crossSpace}, moderation: ${profile.rep.moderation} }`
  ].join('\n')
}

function reset() {
  Object.assign(profile, defaults())
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">
          {{ p('title') }}
        </h2>
        <UButton
          :label="p('reset')"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="reset"
        />
      </div>
    </template>

    <div class="grid gap-8 md:grid-cols-2">
      <div class="space-y-6">
        <UFormField
          :hint="tone"
          name="formality"
        >
          <span
            id="formality-label"
            class="mb-1.5 block text-sm font-medium text-default"
          >
            {{ p('formality.label') }}
          </span>

          <USlider
            v-model="profile.formality"
            role="group"
            aria-labelledby="formality-label"
            :min="0"
            :max="1"
            :step="0.05"
            tooltip
          />

          <div class="mt-1 flex justify-between text-xs text-muted">
            <span>{{ p('formality.casual') }}</span>
            <span>{{ p('formality.academic') }}</span>
          </div>
        </UFormField>

        <UFormField
          name="media"
        >
          <URadioGroup
            v-model="profile.mediaPreference"
            :legend="p('media.label')"
            :items="mediaItems"
            variant="card"
            orientation="horizontal"
            indicator="hidden"
          />
        </UFormField>

        <UFormField :label="p('cadence.label')">
          <USelect
            v-model="profile.postingCadence"
            :items="cadenceItems"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="moderation"
        >
          <URadioGroup
            v-model="profile.moderationStyle"
            :legend="p('moderation.label')"
            :items="moderationItems"
            variant="card"
            orientation="horizontal"
            indicator="hidden"
          />
        </UFormField>

        <UFormField :label="p('language.label')">
          <USelect
            v-model="profile.language"
            :items="languageItems"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">
            {{ p('reputation.title') }}
          </h3>
          <UBadge
            :label="p('reputation.overall', { score: fmtPercent(overall) })"
            :color="repColor(overall)"
            variant="subtle"
          />
        </div>

        <div
          v-for="key in repKeys"
          :key="key"
          class="space-y-1.5"
        >
          <div class="flex items-center justify-between text-sm">
            <span>{{ p(`reputation.${key}`) }}</span>
            <span class="text-muted">{{ fmtPercent(profile.rep[key]) }}</span>
          </div>
          <UProgress
            :model-value="Math.round(profile.rep[key] * 100)"
            :max="100"
            :color="repColor(profile.rep[key])"
            size="md"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {{ p('snapshot') }}
      </p>
      <pre class="overflow-x-auto rounded-md bg-elevated p-3 text-xs">{{ snapshot }}</pre>
    </template>
  </UCard>
</template>
