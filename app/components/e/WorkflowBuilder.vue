<script setup lang="ts">
const w = useWorkflowT()
const { n, locale } = useI18n()
const toast = useToast()

const editing = ref(false)
const active = ref(true)

const sampleSteps = (): Step[] => [
  {
    id: 'dm1',
    type: 'dm',
    text: w('sample.intro', { name: token('member.name') })
  },
  { id: 'w1', type: 'wait', hours: 24 },
  {
    id: 'loop1',
    type: 'loop',
    body: [
      {
        id: 'dm2',
        type: 'dm',
        text: w('sample.spaceWelcome', { space: token('space.name') })
      }
    ]
  },
  {
    id: 'dm3',
    type: 'dm',
    text: w('sample.live', { post: token('post.title') })
  },
  { id: 'w2', type: 'wait', hours: 48 },
  {
    id: 'br1',
    type: 'branch',
    field: 'member.trust_level',
    op: '<',
    value: 3,
    yes: [{ id: 'dm4', type: 'dm', text: w('sample.voice') }],
    no: [{ id: 'dm5', type: 'dm', text: w('sample.advanced') }]
  }
]

const steps = ref<Step[]>(sampleSteps())

const runs = 1247
const failures = 0
const lastRun = computed(() =>
  new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }).format(-2, 'hour')
)

function duplicate() {
  toast.add({ title: w('duplicated'), icon: 'i-lucide-copy' })
}

function remove() {
  toast.add({ title: w('deleted'), icon: 'i-lucide-trash-2', color: 'error' })
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2 class="font-semibold">
          {{ w('title', { name: w('sample.name') }) }}
        </h2>
        <UBadge
          :label="active ? w('active') : w('inactive')"
          :color="active ? 'success' : 'neutral'"
          variant="subtle"
        />
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex items-center gap-2 text-sm">
        <UBadge
          :label="w('trigger.when')"
          color="primary"
          variant="subtle"
        />
        <span>{{ w('trigger.memberJoins') }}</span>
      </div>

      <EWorkflowSteps
        v-model="steps"
        :editing="editing"
      />

      <p
        v-if="editing"
        class="text-xs text-muted"
      >
        {{ w('dragHint') }}
      </p>
    </div>

    <template #footer>
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UButton
            :label="editing ? w('actions.done') : w('actions.edit')"
            :icon="editing ? 'i-lucide-check' : 'i-lucide-pencil'"
            @click="editing = !editing"
          />
          <UButton
            :label="w('actions.duplicate')"
            icon="i-lucide-copy"
            color="neutral"
            variant="outline"
            @click="duplicate"
          />
          <UButton
            :label="active ? w('actions.deactivate') : w('actions.activate')"
            :icon="active ? 'i-lucide-pause' : 'i-lucide-play'"
            color="neutral"
            variant="outline"
            @click="active = !active"
          />
          <UButton
            :label="w('actions.delete')"
            icon="i-lucide-trash-2"
            color="error"
            variant="outline"
            @click="remove"
          />
        </div>

        <p class="text-sm text-muted">
          {{ w('stats.runs', { count: n(runs) }) }}
          ·
          {{ w('stats.last', { time: lastRun }) }}
          ·
          {{ w('stats.failures', { count: n(failures) }) }}
        </p>
      </div>
    </template>
  </UCard>
</template>
