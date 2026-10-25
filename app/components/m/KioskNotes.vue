<script setup lang="ts">
type ReadResult = Awaited<ReturnType<ReturnType<typeof useKioskNotes>['read']>>

const props = defineProps<{
  serial?: string
  online: boolean
}>()

const { t, locale } = useI18n()
const { attach, read, stored } = useKioskNotes()

const writeSerial = ref(props.serial ?? '')
const text = ref('')
const readSerial = ref('')
const busy = ref(false)
const attached = ref<'exists' | 'invalid' | 'ok' | null>(null)
const opened = ref<ReadResult | null>(null)

const dateFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }))

async function send() {
  busy.value = true
  try {
    attached.value = await attach(writeSerial.value, text.value.trim())
    if (attached.value === 'ok') text.value = ''
  } finally {
    busy.value = false
  }
}

async function readNote() {
  busy.value = true
  try {
    opened.value = await read(readSerial.value)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <UAlert
      v-if="!online"
      color="warning"
      variant="soft"
      icon="i-lucide-wifi-off"
      :title="t('kiosk.offlineNotice')"
    />

    <section class="space-y-2">
      <h3 class="text-sm font-bold">
        {{ t('kiosk.notes.writeTitle') }}
      </h3>
      <UInput
        v-model="writeSerial"
        :placeholder="t('kiosk.notes.serial')"
        class="w-full font-mono"
      />
      <UTextarea
        v-model="text"
        :rows="3"
        :maxlength="280"
        :placeholder="t('kiosk.notes.placeholder')"
        class="w-full"
      />
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-lock-keyhole"
          :label="t('kiosk.notes.attach')"
          color="info"
          :loading="busy"
          :disabled="!online || !text.trim() || !writeSerial.trim()"
          @click="send"
        />
        <span class="text-xs text-muted">{{ text.length }}/280</span>
      </div>
      <UAlert
        v-if="attached"
        :color="attached === 'ok' ? 'success' : 'error'"
        variant="soft"
        :title="t(`kiosk.notes.attached.${attached}`, { days: NOTE_DAYS })"
      />
    </section>

    <USeparator />

    <section class="space-y-2">
      <h3 class="text-sm font-bold">
        {{ t('kiosk.notes.readTitle') }}
      </h3>
      <UInput
        v-model="readSerial"
        :placeholder="t('kiosk.notes.serial')"
        class="w-full font-mono"
      />
      <UButton
        icon="i-lucide-mail-open"
        :label="t('kiosk.notes.read')"
        color="info"
        :loading="busy"
        :disabled="!online || !readSerial.trim()"
        @click="readNote"
      />
      <div
        v-if="opened?.ok"
        class="space-y-2 rounded-sm border border-info/25 bg-info/10 p-3 text-sm"
      >
        <p class="whitespace-pre-wrap">
          {{ opened.text }}
        </p>
        <UBadge
          color="neutral"
          variant="subtle"
          icon="i-lucide-trash-2"
          :label="t('kiosk.notes.deleted')"
        />
      </div>
      <UAlert
        v-else-if="opened"
        color="error"
        variant="soft"
        icon="i-lucide-mail-x"
        :title="t(`kiosk.notes.readFailed.${opened.reason}`)"
      />
    </section>

    <USeparator />

    <section class="space-y-2">
      <h3 class="text-sm font-bold">
        {{ t('kiosk.notes.serverTitle') }}
      </h3>
      <p class="text-xs text-muted">
        {{ t('kiosk.notes.serverHint') }}
      </p>
      <p
        v-if="!stored.length"
        class="text-sm text-muted"
      >
        {{ t('kiosk.notes.serverEmpty') }}
      </p>
      <ul
        v-else
        class="space-y-1"
      >
        <li
          v-for="note in stored"
          :key="note.id"
          class="rounded-sm bg-elevated/50 px-3 py-1.5 font-mono text-xs"
        >
          <p>{{ note.id.slice(0, 16) }}…</p>
          <p class="truncate text-muted">
            {{ note.ciphertext.slice(0, 32) }}… ({{ note.ciphertext.length }})
          </p>
          <p class="text-muted">
            {{ t('kiosk.expires') }}: {{ dateFormat.format(new Date(note.expiresAt)) }}
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>
