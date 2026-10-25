<script lang="ts" setup>
const { t } = useI18n()
const toast = useToast()

const colors = computed(() => [
  { label: t('brand.colors.primary'), value: 'primary', swatch: 'bg-primary', ring: 'ring-primary' },
  { label: t('brand.colors.secondary'), value: 'secondary', swatch: 'bg-secondary', ring: 'ring-secondary' },
  { label: t('brand.colors.success'), value: 'success', swatch: 'bg-success', ring: 'ring-success' },
  { label: t('brand.colors.info'), value: 'info', swatch: 'bg-info', ring: 'ring-info' },
  { label: t('brand.colors.warning'), value: 'warning', swatch: 'bg-warning', ring: 'ring-warning' },
  { label: t('brand.colors.error'), value: 'error', swatch: 'bg-error', ring: 'ring-error' }
] as const)

type Accent = (typeof colors.value)[number]['value']

const maxSize = 2 * 1024 * 1024

const name = ref('Cat Inc.')
const accent = ref<Accent>('primary')
const file = ref<File | null>(null)
const logo = ref('')

const initial = computed(() => (name.value.trim()[0] ?? 'A').toUpperCase())
const accentBg = computed(() => colors.value.find(c => c.value === accent.value)!.swatch)

const actions = computed(() => [
  { label: t('brand.newProject'), icon: 'i-lucide-plus' },
  { label: t('brand.invite'), icon: 'i-lucide-user-plus' },
  { label: t('brand.connect'), icon: 'i-lucide-plug' },
  { label: t('brand.preferences'), icon: 'i-lucide-settings' }
])

function revoke() {
  if (logo.value) URL.revokeObjectURL(logo.value)
  logo.value = ''
}

watch(file, (value) => {
  revoke()
  if (!value) return
  if (!value.type.startsWith('image/')) {
    toast.add({ title: t('brand.errors.notImage'), color: 'error' })
    file.value = null
    return
  }
  if (value.size > maxSize) {
    toast.add({ title: t('brand.errors.tooLarge'), color: 'error' })
    file.value = null
    return
  }
  logo.value = URL.createObjectURL(value)
})

function onReject() {
  toast.add({ title: t('brand.errors.notImage'), color: 'error' })
}

function save() {
  toast.add({ title: t('brand.saved'), color: 'success', icon: 'i-lucide-check' })
}

onBeforeUnmount(revoke)
</script>

<template>
  <UContainer class="py-16 lg:py-24">
    <div class="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
      <Motion
        as="div"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, ease: 'easeOut' }"
      >
        <h1 class="text-3xl font-bold tracking-tight">
          {{ t('brand.title') }}
        </h1>
        <p class="mt-2 text-muted">
          {{ t('brand.subtitle') }}
        </p>

        <div class="mt-8 grid gap-6">
          <UFormField :label="t('brand.fields.name')">
            <UInput
              v-model="name"
              :placeholder="t('brand.fields.namePlaceholder')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('brand.fields.logo')">
            <UFileUpload
              v-model="file"
              accept="image/*"
              layout="list"
              :label="t('brand.upload.label')"
              :description="t('brand.upload.description')"
              class="w-full"
              @reject="onReject"
            />
          </UFormField>

          <fieldset class="grid gap-2">
            <legend class="text-sm font-medium">
              {{ t('brand.fields.accent') }}
            </legend>
            <div class="mt-2 flex flex-wrap gap-3">
              <button
                v-for="color in colors"
                :key="color.value"
                type="button"
                class="grid size-9 place-items-center rounded-full ring-offset-2 ring-offset-default outline-none transition focus-visible:ring-2"
                :class="[color.swatch, accent === color.value ? `ring-2 ${color.ring}` : '']"
                :aria-label="color.label"
                :aria-pressed="accent === color.value"
                @click="accent = color.value"
              >
                <AnimatePresence>
                  <Motion
                    v-if="accent === color.value"
                    as="span"
                    :initial="{ scale: 0 }"
                    :animate="{ scale: 1 }"
                    :exit="{ scale: 0 }"
                    :transition="{ duration: 0.15 }"
                  >
                    <UIcon
                      name="i-lucide-check"
                      class="size-4 text-inverted"
                    />
                  </Motion>
                </AnimatePresence>
              </button>
            </div>
          </fieldset>

          <UButton
            :label="t('brand.save')"
            :color="accent"
            class="w-fit"
            @click="save"
          />
        </div>
      </Motion>

      <Motion
        as="div"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, delay: 0.1, ease: 'easeOut' }"
      >
        <p class="mb-3 text-sm font-medium text-muted">
          {{ t('brand.preview') }}
        </p>

        <UPageCard
          spotlight
          :spotlight-color="accent"
          :title="name || t('brand.fallbackName')"
          :description="t('brand.meta', { count: 3 })"
          :ui="{ leading: 'mb-0', container: 'gap-4' }"
        >
          <template #leading>
            <img
              v-if="logo"
              :src="logo"
              alt="Logo"
              class="size-12 rounded-lg object-cover"
            >
            <span
              v-else
              class="grid size-12 place-items-center rounded-lg text-lg font-bold text-inverted transition-colors duration-200"
              :class="accentBg"
            >
              {{ initial }}
            </span>
          </template>

          <template #footer>
            <UCollapsible class="flex flex-col gap-2">
              <UButton
                :label="t('brand.quickActions')"
                icon="i-lucide-zap"
                trailing-icon="i-lucide-chevron-down"
                color="neutral"
                variant="ghost"
                :ui="{ trailingIcon: 'ms-auto transition-transform group-data-[state=open]:rotate-180' }"
                class="group w-40"
              />

              <template #content>
                <div class="flex flex-wrap gap-2 pt-1">
                  <UButton
                    v-for="action in actions"
                    :key="action.icon"
                    :label="action.label"
                    :icon="action.icon"
                    :color="accent"
                    variant="ghost"
                    class="w-40"
                  />
                  <MTeamMembersModal />
                  <MSpectiveModal />
                </div>
              </template>
            </UCollapsible>
          </template>
        </UPageCard>
      </Motion>
    </div>
  </UContainer>
</template>
