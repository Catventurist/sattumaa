<script setup lang="ts">
defineProps<{ editing: boolean }>()
const steps = defineModel<Step[]>({ required: true })

const w = useWorkflowT()
const dragFrom = ref<number | null>(null)

const icons: Record<StepType, string> = {
  dm: 'i-lucide-message-circle',
  wait: 'i-lucide-clock',
  branch: 'i-lucide-git-branch',
  loop: 'i-lucide-repeat'
}

const addItems = computed(() =>
  (Object.keys(icons) as StepType[]).map(type => ({
    label: w(`steps.${type}`),
    icon: icons[type],
    onSelect: () => { steps.value.push(newStep(type)) }
  }))
)

const variableItems = (step: Step) =>
  variables.map(v => ({
    label: v,
    onSelect: () => { step.text = (step.text ?? '') + token(v) }
  }))

function drop(to: number) {
  if (dragFrom.value === null || dragFrom.value === to) return
  const next = [...steps.value]
  const [moved] = next.splice(dragFrom.value, 1)
  next.splice(to, 0, moved!)
  steps.value = next
  dragFrom.value = null
}

function remove(index: number) {
  steps.value.splice(index, 1)
}
</script>

<template>
  <div class="space-y-3">
    <TransitionGroup
      tag="ul"
      name="list"
      class="space-y-3 border-l-2 border-muted pl-4"
    >
      <li
        v-for="(step, i) in steps"
        :key="step.id"
        class="relative"
        :class="{ 'opacity-50': dragFrom === i }"
        :draggable="editing"
        @dragstart.stop="dragFrom = i"
        @dragover.prevent.stop
        @drop.stop="drop(i)"
        @dragend="dragFrom = null"
      >
        <span class="absolute left-[-1.3rem] top-4 size-2 rounded-full bg-primary" />

        <div
          class="flex items-start gap-2 rounded-md border border-default p-3"
          :class="{ 'cursor-grab': editing }"
        >
          <UIcon
            v-if="editing"
            name="i-lucide-grip-vertical"
            class="mt-1 size-4 shrink-0 text-muted"
          />
          <UIcon
            :name="icons[step.type]"
            class="mt-1 size-4 shrink-0"
          />

          <div class="min-w-0 flex-1 space-y-2">
            <span class="text-sm font-medium">{{ w(`steps.${step.type}`) }}</span>

            <template v-if="step.type === 'dm'">
              <div
                v-if="editing"
                class="flex items-center gap-2"
              >
                <UInput
                  v-model="step.text"
                  :placeholder="w('placeholder')"
                  class="flex-1"
                />
                <UDropdownMenu :items="variableItems(step)">
                  <UButton
                    icon="i-lucide-braces"
                    color="neutral"
                    variant="outline"
                    :aria-label="w('insertVariable')"
                  />
                </UDropdownMenu>
              </div>
              <p
                v-else
                class="flex flex-wrap items-center gap-1 text-sm"
              >
                <template
                  v-for="(part, n) in splitVariables(step.text)"
                  :key="n"
                >
                  <UBadge
                    v-if="part.variable"
                    :label="part.text"
                    color="info"
                    variant="subtle"
                    size="sm"
                  />
                  <span v-else>{{ part.text }}</span>
                </template>
              </p>
            </template>

            <template v-else-if="step.type === 'wait'">
              <UInputNumber
                v-if="editing"
                v-model="step.hours"
                :min="1"
                class="w-32"
              />
              <p
                v-else
                class="text-sm"
              >
                {{ w('wait', { count: step.hours }, step.hours) }}
              </p>
            </template>

            <template v-else-if="step.type === 'branch'">
              <div class="flex flex-wrap items-center gap-2 text-sm">
                <span class="text-muted">{{ w('branch.if') }}</span>
                <template v-if="editing">
                  <USelect
                    v-model="step.field"
                    :items="variables"
                    class="w-48"
                  />
                  <USelect
                    v-model="step.op"
                    :items="['<', '>=', '=']"
                    class="w-20"
                  />
                  <UInputNumber
                    v-model="step.value"
                    class="w-28"
                  />
                </template>
                <UBadge
                  v-else
                  :label="`${step.field} ${step.op} ${step.value}`"
                  color="warning"
                  variant="subtle"
                />
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <UBadge
                    :label="w('branch.then')"
                    color="success"
                    variant="subtle"
                  />
                  <EWorkflowSteps
                    v-model="step.yes!"
                    :editing="editing"
                  />
                </div>
                <div class="space-y-2">
                  <UBadge
                    :label="w('branch.else')"
                    color="neutral"
                    variant="subtle"
                  />
                  <EWorkflowSteps
                    v-model="step.no!"
                    :editing="editing"
                  />
                </div>
              </div>
            </template>

            <template v-else-if="step.type === 'loop'">
              <p class="text-sm">
                {{ w('loop.each') }}
              </p>
              <EWorkflowSteps
                v-model="step.body!"
                :editing="editing"
              />
            </template>
          </div>

          <UButton
            v-if="editing"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            :aria-label="w('actions.delete')"
            @click="remove(i)"
          />
        </div>
      </li>
    </TransitionGroup>

    <UDropdownMenu
      v-if="editing"
      :items="addItems"
    >
      <UButton
        icon="i-lucide-plus"
        :label="w('add')"
        color="neutral"
        variant="subtle"
        size="sm"
      />
    </UDropdownMenu>
  </div>
</template>
