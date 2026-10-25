<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

type Role = 'owner' | 'admin' | 'member' | 'viewer'
type Status = 'active' | 'invited'

interface Member {
  name: string
  email: string
  avatar: string
  role: Role
  status: Status
}

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  { title: undefined, description: undefined }
)

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()

const query = ref('')

const members = ref<Member[]>([
  { name: 'Maya', email: 'maya@cat.com', avatar: '/cat.png', role: 'owner', status: 'active' },
  { name: 'Carter', email: 'liam@cat.com', avatar: '/cat.png', role: 'admin', status: 'active' },
  { name: 'Peter', email: 'priya@cat.com', avatar: '/cat.png', role: 'member', status: 'active' },
  { name: 'Sammy', email: 'sam@cat.com', avatar: '/cat.png', role: 'viewer', status: 'invited' }
])

const roles = computed(() =>
  (['owner', 'admin', 'member', 'viewer'] as Role[]).map(value => ({
    label: t(`team.roles.${value}`),
    value
  }))
)

const columns = computed<TableColumn<Member>[]>(() => [
  { accessorKey: 'name', header: t('team.columns.name') },
  { accessorKey: 'status', header: t('team.columns.status') },
  { accessorKey: 'role', header: t('team.columns.role') },
  { id: 'actions' }
])

function initials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function remove(email: string) {
  members.value = members.value.filter(member => member.email !== email)
  toast.add({ title: t('team.removed'), color: 'success', icon: 'i-lucide-check' })
}

function rowItems(member: Member) {
  return [
    [
      {
        label: t('team.actions.resend'),
        icon: 'i-lucide-mail',
        onSelect: () => toast.add({ title: t('team.reminderSent', { name: member.name }), color: 'info' })
      },
      {
        label: t('team.actions.permissions'),
        icon: 'i-lucide-shield',
        onSelect: () => toast.add({ title: t('team.permissionsHint'), color: 'info' })
      }
    ],
    [
      {
        label: t('team.actions.remove'),
        icon: 'i-lucide-trash-2',
        color: 'error' as const,
        disabled: member.role === 'owner',
        onSelect: () => remove(member.email)
      }
    ]
  ]
}

function invite() {
  toast.add({ title: t('team.inviteHint'), color: 'info' })
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.title ?? t('team.title')"
    :description="props.description ?? t('team.description')"
    :ui="{ content: 'max-w-3xl' }"
  >
    <UButton
      :label="t('team.open')"
      icon="i-lucide-users"
      color="neutral"
      variant="outline"
    />

    <template #title>
      <div class="flex items-center gap-2">
        <span>{{ props.title ?? t('team.title') }}</span>
        <UBadge
          :label="String(members.length)"
          color="neutral"
          variant="subtle"
        />
      </div>
    </template>

    <template #actions>
      <UButton
        :label="t('team.invite')"
        icon="i-lucide-user-plus"
        size="sm"
        @click="invite"
      />
    </template>

    <template #body>
      <div class="space-y-4">
        <UInput
          v-model="query"
          icon="i-lucide-search"
          :placeholder="t('team.search')"
          :aria-label="t('team.search')"
          class="w-full max-w-xs"
        />

        <UTable
          v-model:global-filter="query"
          :data="members"
          :columns="columns"
          :get-row-id="(row: Member) => row.email"
          :empty="t('team.empty')"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar
                :src="row.original.avatar"
                :text="initials(row.original.name)"
                :alt="row.original.name"
              />
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">
                  {{ row.original.name }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ row.original.email }}
                </p>
              </div>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :label="t(`team.status.${row.original.status}`)"
              :color="row.original.status === 'active' ? 'success' : 'neutral'"
              variant="subtle"
            />
          </template>

          <template #role-cell="{ row }">
            <USelect
              v-model="row.original.role"
              :items="roles"
              size="sm"
              class="w-32"
              :disabled="row.original.role === 'owner'"
              :aria-label="t('team.roleFor', { name: row.original.name })"
            />
          </template>

          <template #actions-cell="{ row }">
            <div class="text-right">
              <UDropdownMenu
                :items="rowItems(row.original)"
                :content="{ align: 'end' }"
              >
                <UButton
                  icon="i-lucide-ellipsis"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="t('team.actionsFor', { name: row.original.name })"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>
      </div>
    </template>
  </UModal>
</template>
