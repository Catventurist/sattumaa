<script setup lang="ts">
type NotifType = 'error' | 'warning' | 'info' | 'success'
type ChipPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
type Color = 'primary' | 'error' | 'warning' | 'info' | 'success'

interface Group {
  id: string
  types: NotifType[]
  color: Color
  position: ChipPosition
  icon: string
  align: 'start' | 'end'
}

const { t } = useI18n()
const p = (key: string, params: Record<string, unknown> = {}, plural?: number) =>
  plural === undefined
    ? t(`persona.${key}`, params)
    : t(`persona.${key}`, params, plural)

const persona = usePersona()
const split = computed(() => persona.value === 'power' || persona.value === 'catmin')

const types: Record<NotifType, { color: Color, position: ChipPosition, icon: string, align: 'start' | 'end' }> = {
  error: { color: 'error', position: 'top-left', icon: 'i-lucide-octagon-alert', align: 'end' },
  warning: { color: 'warning', position: 'bottom-left', icon: 'i-lucide-triangle-alert', align: 'start' },
  info: { color: 'info', position: 'bottom-right', icon: 'i-lucide-info', align: 'start' },
  success: { color: 'success', position: 'top-right', icon: 'i-lucide-circle-check', align: 'end' }
}

const typeIds = Object.keys(types) as NotifType[]

const { items } = useNotifications()

const groups = computed<Group[]>(() =>
  split.value
    ? typeIds.map(type => ({ id: type, types: [type], ...types[type] }))
    : [{
        id: 'all',
        types: typeIds,
        color: 'primary',
        position: 'top-right',
        icon: 'i-lucide-bell',
        align: 'end'
      }]
)

const itemsOf = (group: Group) => items.value.filter(i => group.types.includes(i.type))
const countText = (group: Group) => {
  const n = itemsOf(group).length
  return n > 99 ? '99+' : n
}
const groupName = (group: Group) =>
  group.id === 'all' ? p('notifications.title') : p(`notifications.types.${group.id}`)
const label = (group: Group) => {
  const n = itemsOf(group).length
  return `${groupName(group)}: ${p('notifications.label', { count: n }, n)}`
}

function dismiss(id: number) {
  items.value = items.value.filter(i => i.id !== id)
}

function markAll(group: Group) {
  items.value = items.value.filter(i => !group.types.includes(i.type))
}
</script>

<template>
  <div class="flex py-2 items-center gap-4">
    <UPopover
      v-for="group in groups"
      :key="group.id"
      :content="{ side: 'bottom', align: group.align }"
    >
      <UChip
        :text="countText(group)"
        :show="itemsOf(group).length > 0"
        :color="group.color"
        :position="group.position"
        size="2xl"
      >
        <UButton
          :icon="group.icon"
          :color="group.id === 'all' ? 'neutral' : group.color"
          :variant="group.id === 'all' ? 'outline' : 'subtle'"
          :label="split ? undefined : p('notifications.title')"
          :aria-label="label(group)"
        />
      </UChip>

      <template #content>
        <div class="w-80 p-2">
          <div class="flex items-center justify-between px-2 py-1">
            <span class="text-sm font-medium">{{ groupName(group) }}</span>
            <UButton
              v-if="itemsOf(group).length > 0"
              :label="p('notifications.markAll')"
              color="neutral"
              variant="link"
              size="xs"
              @click="markAll(group)"
            />
          </div>

          <TransitionGroup
            v-if="itemsOf(group).length > 0"
            tag="ul"
            name="list"
            class="space-y-1"
          >
            <li
              v-for="item in itemsOf(group)"
              :key="item.id"
              class="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-elevated"
            >
              <div class="flex items-center gap-2">
                <UChip
                  standalone
                  inset
                  :color="types[item.type].color"
                />
                <span class="text-sm">
                  {{ p(`notifications.items.${item.key}`, { name: item.name }) }}
                </span>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="p('notifications.markAll')"
                @click="dismiss(item.id)"
              />
            </li>
          </TransitionGroup>

          <UEmpty
            v-else
            :icon="group.icon"
            :description="p('notifications.empty')"
            size="sm"
          />
        </div>
      </template>
    </UPopover>
  </div>
</template>
