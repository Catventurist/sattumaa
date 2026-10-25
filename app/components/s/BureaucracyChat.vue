<script setup lang="ts">
type Step = 'situation' | 'appeal' | 'done'
type Role = 'user' | 'assistant'
type Status = 'ready' | 'streaming'

interface ChatMessage {
  id: string
  role: Role
  parts: { type: 'text', text: string }[]
}

const { t } = useI18n()

const step = ref<Step>('situation')
const status = ref<Status>('ready')
const input = ref('')
const messages = ref<ChatMessage[]>([])

const thinking = ref('')
const thinkingActive = ref(false)
const temperature = ref(1)

let counter = 0
let run = 0

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function sample(vocab: string[], temp: number): string {
  const weights = vocab.map((_, i) => (1 / (i + 1)) ** (1 / temp))
  let r = Math.random() * weights.reduce((sum, w) => sum + w, 0)
  for (const [i, w] of weights.entries()) {
    r -= w
    if (r <= 0) return vocab[i] ?? ''
  }
  return vocab.at(-1) ?? ''
}

function confidence(text: string): string {
  let h = 0
  for (const c of text) h = (h * 31 + (c.codePointAt(0) ?? 0)) >>> 0
  return (0.9 + (h % 99) / 1000).toFixed(3)
}

async function think(text: string): Promise<boolean> {
  const id = ++run
  const vocab = t('chat.tokens').split(' ')
  const length = 40 + Math.floor(Math.random() * 40)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  temperature.value = 0.5 + Math.random()
  thinking.value = ''
  thinkingActive.value = true

  for (let i = 0; i < length; i++) {
    if (id !== run) return false
    thinking.value += `${sample(vocab, temperature.value)} `
    await sleep(reduced ? 0 : 25 + Math.random() * 60)
  }
  if (id !== run) return false

  thinking.value += t('chat.verdict', { p: confidence(text) })
  thinkingActive.value = false
  return true
}

function push(role: Role, text: string) {
  messages.value.push({ id: String(counter++), role, parts: [{ type: 'text', text }] })
}

function reset() {
  run++
  counter = 0
  step.value = 'situation'
  status.value = 'ready'
  input.value = ''
  thinking.value = ''
  thinkingActive.value = false
  messages.value = []
  push('assistant', t('chat.ask'))
}

reset()

async function onSubmit() {
  const text = input.value.trim()
  if (!text || step.value === 'done' || status.value !== 'ready') return

  push('user', text)
  input.value = ''
  status.value = 'streaming'

  const finished = await think(text)
  if (!finished) return
  status.value = 'ready'

  if (step.value === 'situation') {
    push('assistant', t('chat.denied', { reason: text }))
    push('assistant', t('chat.appealPrompt'))
    step.value = 'appeal'
  } else {
    push('assistant', t('chat.appealDenied', { reason: text }))
    step.value = 'done'
  }
}

onBeforeUnmount(() => {
  run++
})
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <UChatMessages
      :messages="messages"
      :status="status"
      :assistant="{ icon: 'i-lucide-landmark' }"
      :should-scroll-to-bottom="false"
      :ui="{ root: '[&>article]:last-of-type:min-h-0' }"
    />

    <div
      v-if="thinking"
      class="flex flex-col gap-2"
    >
      <UChatReasoning
        :text="thinking"
        :streaming="thinkingActive"
        icon="i-lucide-brain"
      />
      <UBadge
        :label="`T=${temperature.toFixed(2)}`"
        color="neutral"
        variant="subtle"
        class="self-start"
      />
    </div>

    <UAlert
      v-if="step === 'situation' && messages.length === 1"
      role="status"
      :description="t('chat.hint')"
      icon="i-lucide-info"
      color="neutral"
      variant="subtle"
    />

    <UChatPrompt
      v-if="step !== 'done'"
      id="chat-prompt"
      v-model="input"
      name="chat-prompt"
      autocomplete="off"
      :status="status"
      :placeholder="t('chat.placeholder')"
      @submit="onSubmit"
    >
      <UChatPromptSubmit :status="status" />
    </UChatPrompt>

    <UButton
      v-else
      :label="t('chat.restart')"
      icon="i-lucide-rotate-ccw"
      color="neutral"
      variant="outline"
      @click="reset"
    />
  </div>
</template>
