<script setup lang="ts">
interface Props {
  open: boolean
  constraints?: HTMLElement | null
}

interface Channel {
  key: string
  icon: string
  to: string
  app?: string
}

const { open, constraints = null } = defineProps<Props>()

const emit = defineEmits<{
  minimize: []
  close: []
  launch: [id: WinKey]
}>()

const { t } = useI18n()
const { community } = useAppConfig()

const channels = computed<Channel[]>(() => [
  { key: 'github', icon: 'i-simple-icons-github', to: community.github },
  { key: 'jitsi', icon: 'i-simple-icons-jitsi', to: community.jitsi, app: 'jitsi' },
  { key: 'telegram', icon: 'i-simple-icons-telegram', to: community.telegram },
  { key: 'signal', icon: 'i-simple-icons-signal', to: community.signal }
].filter(channel => channel.to || channel.app))
</script>

<template>
  <MWindow
    :open="open"
    :title="t('communication.title')"
    icon="i-lucide-radio-tower"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <p class="mb-3 text-sm text-inverted/80">
      {{ t('communication.description') }}
    </p>
    <div
      v-if="channels.length"
      class="flex flex-col gap-2"
    >
      <Motion
        v-for="(channel, index) in channels"
        :key="channel.key"
        :initial="{ opacity: 0, x: -8 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: index * 0.05, duration: 0.15 }"
      >
        <MCommunicationLink
          :channel="channel.key"
          :icon="channel.icon"
          :to="channel.to"
          :app="(channel.app as WinKey)"
          @launch="channel.app && emit('launch', channel.app as WinKey)"
        />
      </Motion>
    </div>
    <p
      v-else
      class="text-sm text-inverted/60"
    >
      {{ t('communication.empty') }}
    </p>
  </MWindow>
</template>
