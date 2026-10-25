<script setup lang="ts">
const { t } = useI18n()

const initialData = () => ({
  name: 'Cat',
  role: t('resume.data.role'),
  socials: [
    { name: 'GitHub', icon: 'i-simple-icons-github', url: '#' },
    { name: 'Telegram', icon: 'i-simple-icons-telegram', url: '#' },
    { name: 'Signal', icon: 'i-simple-icons-signal', url: '#' }
  ],
  website: 'github.com/Catventurist',
  location: t('resume.data.location'),
  stack: ['Nuxt', 'Vue', 'TypeScript', 'Node.js', 'Bun', 'Tailwind'],
  education: {
    degree: t('resume.data.education.degree'),
    school: t('resume.data.education.school'),
    period: t('resume.data.education.period')
  },
  about: t('resume.data.about'),
  experience: [0, 1].map(i => ({
    id: i + 1,
    role: t(`resume.data.experience[${i}].role`),
    company: i === 0 ? 'Kitties' : 'Online',
    period: t(`resume.data.experience[${i}].period`),
    description: [0, 1].map(j => t(`resume.data.experience[${i}].description[${j}]`))
  })),
  projects: [0, 1].map(i => ({
    id: i + 1,
    title: t(`resume.data.projects[${i}].title`),
    desc: t(`resume.data.projects[${i}].desc`),
    stars: ['4.2k', '2.1k'][i]
  }))
})

const resume = ref(initialData())
const editing = ref(false)

const initials = computed(() =>
  resume.value.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
)

function setBullets(job: { description: string[] }, value: string) {
  job.description = value.split('\n')
}

function reset() {
  resume.value = initialData()
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadJson() {
  download(
    new Blob([JSON.stringify(resume.value, null, 2)], { type: 'application/json' }),
    'resume.json'
  )
}

function downloadPdf() {
  editing.value = false
  nextTick(() => window.print())
}

let nextId = 100

function addJob() {
  resume.value.experience.push({
    id: nextId++,
    role: t('resume.newJob'),
    company: '',
    period: '',
    description: ['']
  })
}

function removeJob(id: number) {
  resume.value.experience = resume.value.experience.filter(j => j.id !== id)
}

function addProject() {
  resume.value.projects.push({
    id: nextId++,
    title: t('resume.newProject'),
    desc: '',
    stars: '0'
  })
}

function removeProject(id: number) {
  resume.value.projects = resume.value.projects.filter(p => p.id !== id)
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap justify-end gap-2 print:hidden">
      <UButton
        v-if="editing"
        :label="t('resume.reset')"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="ghost"
        @click="reset"
      />
      <UButton
        :label="editing ? t('resume.done') : t('resume.edit')"
        :icon="editing ? 'i-lucide-check' : 'i-lucide-pencil'"
        color="neutral"
        variant="outline"
        @click="editing = !editing"
      />
      <UButton
        :label="t('resume.downloadJson')"
        icon="i-lucide-file-json"
        color="neutral"
        variant="outline"
        @click="downloadJson"
      />
      <UButton
        :label="t('resume.downloadPdf')"
        icon="i-lucide-download"
        @click="downloadPdf"
      />
    </div>

    <Motion
      as="div"
      :variants="container"
      initial="hidden"
      animate="show"
      class="overflow-hidden rounded-lg border border-default bg-default"
    >
      <div class="grid min-h-200 grid-cols-1 md:grid-cols-12">
        <div class="flex flex-col gap-8 border-r border-default bg-elevated/50 p-8 md:col-span-4">
          <Motion
            as="div"
            :variants="item"
            class="space-y-4"
          >
            <UAvatar
              :text="initials"
              size="3xl"
            />

            <div
              v-if="editing"
              class="space-y-2"
            >
              <UFormField :label="t('resume.fields.name')">
                <UInput
                  v-model="resume.name"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('resume.fields.role')">
                <UInput
                  v-model="resume.role"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div v-else>
              <h1 class="text-xl font-semibold tracking-tight text-highlighted">
                {{ resume.name }}
              </h1>
              <p class="mt-1 font-mono text-sm text-muted">
                {{ resume.role }}
              </p>
            </div>

            <div
              v-if="editing"
              class="space-y-2"
            >
              <UFormField
                v-for="social in resume.socials"
                :key="social.name"
                :label="`${social.name} (${t('resume.fields.url')})`"
              >
                <UInput
                  v-model="social.url"
                  :icon="social.icon"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div
              v-else
              class="flex gap-2"
            >
              <UButton
                v-for="social in resume.socials"
                :key="social.name"
                :icon="social.icon"
                :to="social.url"
                :aria-label="social.name"
                color="neutral"
                variant="outline"
                size="sm"
              />
            </div>
          </Motion>

          <USeparator />

          <Motion
            as="div"
            :variants="item"
            class="space-y-3"
          >
            <h2 class="font-mono text-xs font-medium uppercase tracking-wider text-muted">
              {{ t('resume.contact') }}
            </h2>
            <div
              v-if="editing"
              class="space-y-2"
            >
              <UFormField :label="t('resume.fields.website')">
                <UInput
                  v-model="resume.website"
                  icon="i-lucide-globe"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('resume.fields.location')">
                <UInput
                  v-model="resume.location"
                  icon="i-lucide-map-pin"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div
              v-else
              class="space-y-2 text-sm text-muted"
            >
              <ULink
                :to="`https://${resume.website}`"
                class="flex items-center gap-2 hover:text-highlighted"
              >
                <UIcon
                  name="i-lucide-globe"
                  class="size-3.5"
                />
                <span>{{ resume.website }}</span>
              </ULink>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-map-pin"
                  class="size-3.5"
                />
                <span>{{ resume.location }}</span>
              </div>
            </div>
          </Motion>

          <Motion
            as="div"
            :variants="item"
            class="space-y-3"
          >
            <h2 class="font-mono text-xs font-medium uppercase tracking-wider text-muted">
              {{ t('resume.stack') }}
            </h2>
            <UFormField
              v-if="editing"
              :help="t('resume.stackHint')"
            >
              <UInputTags
                v-model="resume.stack"
                class="w-full"
              />
            </UFormField>
            <div
              v-else
              class="flex flex-wrap gap-1.5"
            >
              <UBadge
                v-for="skill in resume.stack"
                :key="skill"
                :label="skill"
                color="neutral"
                variant="outline"
                size="sm"
              />
            </div>
          </Motion>

          <Motion
            as="div"
            :variants="item"
            class="space-y-3"
          >
            <h2 class="font-mono text-xs font-medium uppercase tracking-wider text-muted">
              {{ t('resume.education') }}
            </h2>
            <div
              v-if="editing"
              class="space-y-2"
            >
              <UFormField :label="t('resume.fields.degree')">
                <UInput
                  v-model="resume.education.degree"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('resume.fields.school')">
                <UInput
                  v-model="resume.education.school"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('resume.fields.period')">
                <UInput
                  v-model="resume.education.period"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div v-else>
              <h3 class="text-sm font-medium text-highlighted">
                {{ resume.education.degree }}
              </h3>
              <p class="mt-0.5 text-xs text-muted">
                {{ resume.education.school }}
              </p>
              <p class="mt-1 font-mono text-[10px] text-dimmed">
                {{ resume.education.period }}
              </p>
            </div>
          </Motion>
        </div>

        <div class="space-y-10 p-8 md:col-span-8 md:p-10">
          <Motion
            as="div"
            :variants="item"
            class="space-y-3"
          >
            <h2 class="font-mono text-xs font-medium uppercase tracking-wider text-muted">
              {{ t('resume.about') }}
            </h2>
            <UTextarea
              v-if="editing"
              v-model="resume.about"
              :rows="4"
              autoresize
              class="w-full"
            />
            <p
              v-else
              class="max-w-2xl text-sm leading-relaxed text-muted"
            >
              {{ resume.about }}
            </p>
          </Motion>

          <Motion
            as="div"
            :variants="item"
            class="space-y-6"
          >
            <h2 class="font-mono text-xs font-medium uppercase tracking-wider text-muted">
              {{ t('resume.experience') }}
            </h2>

            <div class="space-y-8">
              <div
                v-for="job in resume.experience"
                :key="job.id"
              >
                <div
                  v-if="editing"
                  class="space-y-2 rounded-md border border-dashed border-default p-3"
                >
                  <div class="flex justify-end">
                    <UButton
                      icon="i-lucide-trash-2"
                      :label="t('resume.remove')"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="removeJob(job.id)"
                    />
                  </div>
                  <div class="grid gap-2 sm:grid-cols-3">
                    <UFormField :label="t('resume.fields.role')">
                      <UInput
                        v-model="job.role"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField :label="t('resume.fields.company')">
                      <UInput
                        v-model="job.company"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField :label="t('resume.fields.period')">
                      <UInput
                        v-model="job.period"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                  <UFormField
                    :label="t('resume.fields.description')"
                    :help="t('resume.fields.bullets')"
                  >
                    <UTextarea
                      :model-value="job.description.join('\n')"
                      :rows="3"
                      autoresize
                      class="w-full"
                      @update:model-value="setBullets(job, $event as string)"
                    />
                  </UFormField>
                </div>
                <div v-else>
                  <div class="mb-1 flex items-baseline justify-between">
                    <h3 class="text-sm font-medium text-highlighted">
                      {{ job.role }}
                    </h3>
                    <span class="font-mono text-xs text-dimmed">{{ job.period }}</span>
                  </div>
                  <p class="mb-3 text-xs text-muted">
                    {{ job.company }}
                  </p>
                  <ul class="ml-3 list-outside list-disc space-y-1.5 text-sm text-muted">
                    <li
                      v-for="(desc, i) in job.description.filter(Boolean)"
                      :key="i"
                    >
                      {{ desc }}
                    </li>
                  </ul>
                </div>
              </div>

              <UButton
                v-if="editing"
                icon="i-lucide-plus"
                :label="t('resume.addJob')"
                color="neutral"
                variant="outline"
                class="border-dashed"
                @click="addJob"
              />
            </div>
          </Motion>

          <Motion
            as="div"
            :variants="item"
            class="space-y-4"
          >
            <h2 class="font-mono text-xs font-medium uppercase tracking-wider text-muted">
              {{ t('resume.projects') }}
            </h2>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="project in resume.projects"
                :key="project.id"
                class="group rounded-md border border-default p-3 transition-all hover:bg-elevated/50"
              >
                <div
                  v-if="editing"
                  class="space-y-2"
                >
                  <div class="flex justify-end">
                    <UButton
                      icon="i-lucide-trash-2"
                      :label="t('resume.remove')"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="removeProject(project.id)"
                    />
                  </div>
                  <UFormField :label="t('resume.fields.title')">
                    <UInput
                      v-model="project.title"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField :label="t('resume.fields.description')">
                    <UTextarea
                      v-model="project.desc"
                      :rows="2"
                      autoresize
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField :label="t('resume.fields.stars')">
                    <UInput
                      v-model="project.stars"
                      class="w-full"
                    />
                  </UFormField>
                </div>
                <template v-else>
                  <div class="mb-1.5 flex items-start justify-between">
                    <h3 class="text-sm font-medium text-highlighted">
                      {{ project.title }}
                    </h3>
                    <UIcon
                      name="i-lucide-arrow-up-right"
                      class="size-3.5 text-dimmed transition-colors group-hover:text-muted"
                    />
                  </div>
                  <p class="mb-2 line-clamp-2 text-xs text-muted">
                    {{ project.desc }}
                  </p>
                  <span class="font-mono text-[10px] text-dimmed">★ {{ project.stars }}</span>
                </template>
              </div>

              <UButton
                v-if="editing"
                icon="i-lucide-plus"
                :label="t('resume.addProject')"
                color="neutral"
                variant="outline"
                class="min-h-24 justify-center border-dashed"
                @click="addProject"
              />
            </div>
          </Motion>
        </div>
      </div>
    </Motion>
  </div>
</template>
