<script setup lang="ts">
const { t, locale } = useI18n()
const { community } = useAppConfig()
const toast = useToast()

const props = defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

function parseDefault() {
  try {
    const url = new URL(community.jitsi)
    return {
      host: url.host,
      room: url.pathname.replace(/^\/+/, '')
    }
  } catch {
    return {
      host: 'meet.jit.si',
      room: ''
    }
  }
}

const fallback = parseDefault()

const room = ref(fallback.room)
const displayName = ref('')
const audioOn = ref(false)
const videoOn = ref(false)
const joined = ref(false)
const loaded = ref(false)

const slug = computed(() => room.value.trim().replace(/[^\w-]+/g, '-'))
const inviteUrl = computed(() => `https://${fallback.host}/${slug.value}`)

const frameUrl = computed(() => {
  const params = new URLSearchParams({
    'config.startWithAudioMuted': String(!audioOn.value),
    'config.startWithVideoMuted': String(!videoOn.value),
    'config.prejoinConfig.enabled': 'false',
    'config.defaultLanguage': JSON.stringify(locale.value),
    ...(displayName.value.trim() && {
      'userInfo.displayName': JSON.stringify(displayName.value.trim())
    })
  })
  return `${inviteUrl.value}#${params.toString()}`
})

function randomRoom() {
  room.value = `m-${crypto.randomUUID().slice(0, 8)}`
}

function join() {
  if (!slug.value) {
    randomRoom()
  }
  loaded.value = false
  joined.value = true
}

function leave() {
  joined.value = false
  loaded.value = false
}

async function copyInvite() {
  await navigator.clipboard.writeText(inviteUrl.value)
  toast.add({
    title: t('jitsi.copied'),
    icon: 'i-lucide-check',
    color: 'success'
  })
}

watch(() => props.open, (value) => {
  if (!value) {
    leave()
  }
})
</script>

<template>
  <MWindow
    :open="open"
    :title="t('jitsi.title')"
    icon="i-lucide-speech"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <form
      v-if="!joined"
      class="flex flex-col gap-3 p-2"
      @submit.prevent="join"
    >
      <UFormField :label="t('jitsi.room')">
        <div class="flex gap-1">
          <UInput
            v-model="room"
            class="flex-1"
            :ui="{ base: 'rounded-none' }"
          />
          <UButton
            square
            color="neutral"
            variant="outline"
            icon="i-lucide-dices"
            :aria-label="t('jitsi.random')"
            class=" bg-primary/20"
            @click="randomRoom"
          />
        </div>
      </UFormField>
      <UFormField :label="t('jitsi.name')">
        <UInput
          v-model="displayName"
          :placeholder="t('jitsi.namePlaceholder')"
          class="w-full"
          :ui="{ base: 'rounded-none' }"
        />
      </UFormField>
      <USwitch
        v-model="audioOn"
        :label="t('jitsi.audio')"
      />
      <USwitch
        v-model="videoOn"
        :label="t('jitsi.video')"
      />
      <UButton
        disabled
        type="submit"
        block
        color="info"
        icon="i-lucide-video"
        :label="t('jitsi.join')"
      />
    </form>

    <div
      v-else
      class="flex flex-col gap-2"
    >
      <div class="relative h-96 border-2 border-inverted/60 bg-primary/20">
        <USkeleton
          v-if="!loaded"
          class="absolute inset-0 rounded-none"
        />
        <iframe
          v-if="frameUrl"
          :src="frameUrl"
          title="Video call"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          class="size-full  border-0"
          @load="loaded = true"
        />
      </div>
      <div class="flex items-center gap-1">
        <UButton
          color="error"
          icon="i-lucide-phone-off"
          :label="t('jitsi.leave')"
          class=""
          @click="leave"
        />
        <span class="flex-1 truncate text-xs text-inverted/60">
          {{ slug }}
        </span>
        <UButton
          square
          color="neutral"
          variant="outline"
          icon="i-lucide-copy"
          :aria-label="t('jitsi.copy')"
          class=" hover:bg-success/20"
          @click="copyInvite"
        />
        <UButton
          square
          color="neutral"
          variant="outline"
          icon="i-lucide-external-link"
          :to="inviteUrl"
          target="_blank"
          :aria-label="t('jitsi.external')"
          class="hover:bg-info/20"
        />
      </div>
    </div>
  </MWindow>
</template>
