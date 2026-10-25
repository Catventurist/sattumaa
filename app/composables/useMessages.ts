export interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  parts: { type: 'text', text: string }[]
}

export interface Conversation {
  id: string
  name: string
  avatar: string
  unread: number
  typing: boolean
  messages: ChatMsg[]
}

interface SeedConversation {
  id: string
  name: string
  avatar: string
  messages: { role: 'user' | 'assistant', text: string }[]
}

const makeMsg = (role: ChatMsg['role'], text: string): ChatMsg => ({
  id: crypto.randomUUID(),
  role,
  parts: [{ type: 'text', text }]
})

export function useMessages() {
  const conversations = useState<Conversation[]>('messages-conversations', () => [])
  const activeId = useState<string | null>('messages-active', () => null)
  const ready = useState('messages-ready', () => false)

  const active = computed(() => conversations.value.find(c => c.id === activeId.value) ?? null)
  const totalUnread = computed(() => conversations.value.reduce((sum, c) => sum + c.unread, 0))

  function init(seed: SeedConversation[]) {
    if (ready.value) return
    ready.value = true
    conversations.value = seed.map(item => ({
      id: item.id,
      name: item.name,
      avatar: item.avatar,
      unread: item.messages.filter(m => m.role === 'assistant').length > 0 && item.messages.at(-1)?.role === 'assistant' ? 1 : 0,
      typing: false,
      messages: item.messages.map(m => makeMsg(m.role, m.text))
    }))
    activeId.value = conversations.value[0]?.id ?? null
    if (active.value) active.value.unread = 0
  }

  function select(id: string) {
    activeId.value = id
    const conversation = conversations.value.find(c => c.id === id)
    if (conversation) conversation.unread = 0
  }

  function send(id: string, text: string, reply: string) {
    const conversation = conversations.value.find(c => c.id === id)
    if (!conversation) return

    conversation.messages.push(makeMsg('user', text))
    conversation.typing = true

    setTimeout(() => {
      conversation.typing = false
      conversation.messages.push(makeMsg('assistant', reply))
      if (activeId.value !== id) {
        conversation.unread++
      }
    }, 900 + Math.random() * 900)
  }

  return { conversations, activeId, active, totalUnread, init, select, send }
}
