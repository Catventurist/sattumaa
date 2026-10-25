<script setup lang="ts">
import { Motion } from 'motion-v'

defineProps<{ constraints?: HTMLElement | null }>()

const open = defineModel<boolean>('open', { default: true })

const { t } = useI18n()
const { conversations, activeId, active, init, select, send } = useMessages()

const draft = ref('')
const query = ref('')
const scroller = useTemplateRef<HTMLElement>('scroller')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return conversations.value.filter((c: { name: string }) => !q || c.name.toLowerCase().includes(q))
})

const lastText = (messages: { parts: { text: string }[] }[]) =>
  messages.at(-1)?.parts[0]?.text ?? ''

function submit() {
  const text = draft.value.trim()
  if (!text || !active.value) return

  const reply = t(`messages.replies.r${Math.floor(Math.random() * 3) + 1}`)
  send(active.value.id, text, reply)
  draft.value = ''
}

async function scrollToBottom() {
  await nextTick()
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
}

watch(
  [activeId, () => active.value?.messages.length, () => active.value?.typing],
  scrollToBottom,
  { flush: 'post' }
)

onMounted(() => {
  init([
    {
      id: 'ana',
      name: 'Ana',
      avatar: '/cat.png',
      messages: [
        { role: 'assistant', text: t('messages.seed.ana1') },
        { role: 'assistant', text: t('messages.seed.ana2') }
      ]
    },
    {
      id: 'jorge',
      name: 'Jorge',
      avatar: '/catbirchdark.webp',
      messages: [
        { role: 'assistant', text: t('messages.seed.jorge1') },
        { role: 'user', text: t('messages.seed.jorge2') }
      ]
    },
    {
      id: 'sara',
      name: 'Sara',
      avatar: '/catbirch.webp',
      messages: [{ role: 'assistant', text: t('messages.seed.sara1') }]
    }
  ])
  scrollToBottom()
})

const emit = defineEmits<{ minimize: [], close: [] }>()
</script>

<template>
  <MWindow
    v-model:open="open"
    :title="t('messages.title')"
    icon="i-lucide-message-circle"
    :constraints="constraints"
    size-class="h-[28rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex min-h-0 flex-1">
      <aside class="flex w-52 shrink-0 flex-col border-e border-default bg-elevated/30">
        <div class="p-1.5">
          <UInput
            v-model="query"
            name="messages"
            size="sm"
            class="w-full"
            icon="i-lucide-search"
            :placeholder="t('messages.search')"
          />
        </div>

        <ul
          v-if="filtered.length"
          class="flex-1 space-y-0.5 overflow-y-auto p-1"
        >
          <li
            v-for="conversation in filtered"
            :key="conversation.id"
          >
            <UButton
              block
              color="neutral"
              :variant="conversation.id === activeId ? 'soft' : 'ghost'"
              class="h-auto justify-start gap-2 py-1.5"
              @click="select(conversation.id)"
            >
              <UAvatar
                :src="conversation.avatar"
                :alt="conversation.name"
                size="sm"
              />
              <span class="flex min-w-0 flex-1 flex-col items-start">
                <span class="w-full truncate text-start text-sm font-medium">{{ conversation.name }}</span>
                <span class="w-full truncate text-start text-xs text-muted">
                  {{ lastText(conversation.messages) }}
                </span>
              </span>
              <UBadge
                v-if="conversation.unread"
                color="error"
                size="sm"
                :label="conversation.unread"
              />
            </UButton>
          </li>
        </ul>

        <UEmpty
          v-else
          class="flex-1"
          icon="i-lucide-search-x"
          :title="t('messages.noMatches')"
        />
      </aside>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <template v-if="active">
          <div class="flex items-center gap-2 border-b border-default px-3 py-1.5">
            <UAvatar
              :src="active.avatar"
              :alt="active.name"
              size="xs"
            />
            <span class="text-sm font-medium">{{ active.name }}</span>
          </div>

          <div
            ref="scroller"
            class="min-h-0 flex-1 space-y-3 overflow-y-auto p-3"
          >
            <Motion
              v-for="message in active.messages"
              :key="message.id"
              as="div"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.15 }"
            >
              <UChatMessage
                :id="message.id"
                :role="message.role"
                :parts="message.parts"
                :side="message.role === 'user' ? 'right' : 'left'"
                :variant="message.role === 'user' ? 'soft' : 'subtle'"
                :color="message.role === 'user' ? 'info' : 'neutral'"
                :avatar="message.role === 'assistant' ? { src: active.avatar, alt: active.name } : undefined"
                compact
              />
            </Motion>

            <Motion
              v-if="active.typing"
              as="div"
              class="flex items-center gap-2 text-xs text-muted"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
            >
              <span
                class="flex gap-1"
                :aria-label="t('messages.typing', { name: active.name })"
              >
                <Motion
                  v-for="i in 3"
                  :key="i"
                  as="span"
                  class="size-1.5 rounded-full bg-muted"
                  :animate="{ opacity: [0.25, 1, 0.25] }"
                  :transition="{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }"
                />
              </span>
              {{ t('messages.typing', { name: active.name }) }}
            </Motion>
          </div>

          <div class="border-t border-default p-2">
            <UChatPrompt
              v-model="draft"
              name="prompt"
              variant="soft"
              :rows="1"
              :maxrows="4"
              :placeholder="t('messages.placeholder')"
              @submit.prevent="submit"
            >
              <template #trailing>
                <UButton
                  type="submit"
                  icon="i-lucide-send"
                  size="xs"
                  square
                  color="info"
                  :disabled="!draft.trim()"
                  :aria-label="t('messages.send')"
                />
              </template>
            </UChatPrompt>
          </div>
        </template>

        <UEmpty
          v-else
          class="flex-1"
          icon="i-lucide-message-circle"
          :title="t('messages.empty')"
        />
      </div>
    </div>
  </MWindow>
</template>
