<script setup lang="ts">
type Priority = 'high' | 'medium' | 'low'

interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
}

const { t } = useI18n()

const maxDescriptionLength = 200
const defaultAssigneeIds = ['sophia', 'liam', 'olivia']

const allMembers = computed<TeamMember[]>(() => [
  { id: 'sophia', name: 'Sophia Williams', role: t('task.roles.designer'), initials: 'SW' },
  { id: 'liam', name: 'Liam Johnson', role: t('task.roles.manager'), initials: 'LJ' },
  { id: 'olivia', name: 'Olivia Smith', role: t('task.roles.researcher'), initials: 'OS' },
  { id: 'mia', name: 'Mia Chen', role: t('task.roles.owner'), initials: 'MC' },
  { id: 'ethan', name: 'Ethan Davis', role: t('task.roles.engineer'), initials: 'ED' }
])

const priorityMap = {
  high: { color: 'error', dot: 'bg-error' },
  medium: { color: 'warning', dot: 'bg-warning' },
  low: { color: 'success', dot: 'bg-success' }
} as const

const title = ref(t('task.defaultTitle'))
const priority = ref<Priority>('high')
const assigneeIds = ref([...defaultAssigneeIds])
const description = ref(t('task.defaultDescription'))
const reminderEnabled = ref(true)
const isSaving = ref(false)
const isSaved = ref(false)

const assignees = computed(() =>
  allMembers.value.filter(m => assigneeIds.value.includes(m.id))
)
const availableMembers = computed(() =>
  allMembers.value.filter(m => !assigneeIds.value.includes(m.id))
)

const priorityItems = computed(() =>
  (Object.keys(priorityMap) as Priority[]).map(key => ({
    label: t(`task.priority.${key}`),
    icon: priority.value === key ? 'i-lucide-check' : 'i-lucide-circle',
    color: priorityMap[key].color,
    onSelect: () => { priority.value = key }
  }))
)

const toolbar = computed(() => [
  { icon: 'i-lucide-bold', label: t('task.toolbar.bold') },
  { icon: 'i-lucide-italic', label: t('task.toolbar.italic') },
  { icon: 'i-lucide-underline', label: t('task.toolbar.underline') },
  { icon: 'i-lucide-list', label: t('task.toolbar.bullets') },
  { icon: 'i-lucide-list-ordered', label: t('task.toolbar.numbers') }
])

function removeAssignee(id: string) {
  assigneeIds.value = assigneeIds.value.filter(i => i !== id)
}

function addPerson() {
  const [next] = availableMembers.value
  if (next) assigneeIds.value.push(next.id)
}

function reset() {
  title.value = t('task.defaultTitle')
  priority.value = 'high'
  assigneeIds.value = [...defaultAssigneeIds]
  description.value = t('task.defaultDescription')
  reminderEnabled.value = true
  isSaved.value = false
}

function save() {
  if (isSaving.value) return
  isSaving.value = true
  isSaved.value = false
  setTimeout(() => {
    isSaving.value = false
    isSaved.value = true
    setTimeout(() => (isSaved.value = false), 2000)
  }, 900)
}
</script>

<template>
  <UCard>
    <template #header>
      <UBadge
        :label="t('task.badge')"
        variant="subtle"
        class="mb-3 rounded-full uppercase"
      />
      <h3 class="text-sm font-semibold uppercase tracking-widest">
        {{ t('task.title') }}
      </h3>
      <p class="mt-1 text-sm text-muted">
        {{ t('task.subtitle') }}
      </p>
    </template>

    <div class="space-y-8">
      <Motion
        as="div"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, ease: 'easeOut' }"
        class="grid gap-6 md:grid-cols-2"
      >
        <UFormField
          :label="t('task.fields.title')"
          :help="t('task.fields.titleHelp')"
        >
          <UInput
            v-model="title"
            class="w-full"
          />
        </UFormField>

        <div class="space-y-1.5">
          <span
            id="priority-label"
            class="block text-sm font-medium text-default"
          >
            {{ t('task.fields.priority') }}
          </span>

          <UDropdownMenu
            :items="priorityItems"
            :content="{ align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="outline"
              block
              aria-labelledby="priority-label"
              trailing-icon="i-lucide-chevron-down"
              :label="t(`task.priority.${priority}`)"
            >
              <template #leading>
                <span
                  class="size-2.5 rounded-full"
                  :class="priorityMap[priority].dot"
                />
              </template>
            </UButton>
          </UDropdownMenu>

          <p class="text-sm text-muted">
            {{ t(`task.priority.${priority}Help`) }}
          </p>
        </div>
      </Motion>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">
            {{ t('task.fields.assign') }}
          </span>
          <UBadge
            :label="t('task.fields.team')"
            color="neutral"
            variant="outline"
            class="rounded-full"
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <AnimatePresence>
            <Motion
              v-for="member in assignees"
              :key="member.id"
              as="div"
              layout
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, scale: 0.9, y: -8 }"
              :transition="{ duration: 0.2 }"
              class="flex items-center gap-3 rounded-lg border border-default px-3 py-2"
            >
              <UAvatar
                :text="member.initials"
                size="md"
              />
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ member.name }}</span>
                <span class="text-xs text-muted">{{ member.role }}</span>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                :aria-label="t('task.actions.removePerson', { name: member.name })"
                @click="removeAssignee(member.id)"
              />
            </Motion>
          </AnimatePresence>

          <UButton
            icon="i-lucide-plus"
            :label="t('task.actions.addPerson')"
            color="neutral"
            variant="outline"
            class="border-dashed"
            :disabled="!availableMembers.length"
            @click="addPerson"
          />
        </div>
      </div>

      <UFormField :label="t('task.fields.description')">
        <template #hint>
          {{ t('task.counter', { remaining: maxDescriptionLength - description.length, max: maxDescriptionLength }) }}
        </template>

        <div class="rounded-lg border border-default">
          <div class="flex items-center gap-1 border-b border-default px-2 py-1">
            <UButton
              v-for="item in toolbar"
              :key="item.icon"
              :icon="item.icon"
              :aria-label="item.label"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>
          <UTextarea
            v-model="description"
            :maxlength="maxDescriptionLength"
            :rows="5"
            variant="none"
            class="w-full"
            :aria-label="t('task.fields.descriptionLabel')"
          />
        </div>
      </UFormField>

      <div class="flex flex-col gap-4 rounded-lg border border-default p-4 md:flex-row md:items-center md:justify-between">
        <USwitch
          v-model="reminderEnabled"
          :label="t('task.reminder.title')"
          :description="t(reminderEnabled ? 'task.reminder.on' : 'task.reminder.off')"
        />
        <UBadge
          label="Sprint Q4"
          color="neutral"
          variant="outline"
          class="w-fit rounded-full"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-rotate-ccw" />
          <span>{{ t('task.actions.resetHint') }}</span>
          <UButton
            :label="t('task.actions.reset')"
            variant="link"
            color="neutral"
            class="px-0"
            @click="reset"
          />
        </div>

        <div class="flex items-center gap-3">
          <AnimatePresence
            mode="popLayout"
            :initial="false"
          >
            <Motion
              v-if="isSaved"
              key="saved"
              as="span"
              :initial="{ opacity: 0, y: 6 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -6 }"
              :transition="{ duration: 0.2 }"
              class="text-sm text-success"
            >
              {{ t('task.actions.saved') }}
            </Motion>
          </AnimatePresence>
          <UButton
            icon="i-lucide-save"
            :label="isSaving ? t('task.actions.saving') : t('task.actions.save')"
            :loading="isSaving"
            @click="save"
          />
        </div>
      </div>
    </template>
  </UCard>
</template>
