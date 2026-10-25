<script setup lang="ts">
import { parseOtpauth, totp } from '~/utils/totp'
import type { VaultFile } from '~/composables/useVault'

const { t } = useI18n()
const toast = useToast()
const vault = useVault()
const { blob, accounts, unlocked } = vault
const pass = ref('')
const pass2 = ref('')
const busy = ref(false)
const addOpen = ref(false)

const form = reactive({
  uri: '',
  issuer: '',
  name: '',
  secret: '',
  period: 30,
  digits: 6,
  algorithm: 'SHA-1' as 'SHA-1' | 'SHA-256' | 'SHA-512'
})

const now = ref(Date.now())
const codes = ref<Record<string, string>>({})

onMounted(() => {
  const tick = setInterval(() => (now.value = Date.now()), 1000)
  onBeforeUnmount(() => clearInterval(tick))
})

watch([now, () => vault.accounts.value], async () => {
  const next: Record<string, string> = {}
  for (const a of vault.accounts.value) {
    try {
      next[a.id] = await totp(a.secret, a, now.value)
    } catch {
      next[a.id] = '------'
    }
  }
  codes.value = next
}, { immediate: true })

const remaining = (period: number) => period - (Math.floor(now.value / 1000) % period)
const pretty = (code = '') => code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code

async function onCreate() {
  if (pass.value.length < 8 || pass.value !== pass2.value) {
    toast.add({ title: t('authenticator.passMismatch'), color: 'error' })
    return
  }
  busy.value = true
  try {
    await vault.create(pass.value)
  } finally {
    busy.value = false
    pass.value = ''
    pass2.value = ''
  }
}

async function onUnlock() {
  busy.value = true
  try {
    await vault.unlock(pass.value)
    pass.value = ''
  } catch {
    toast.add({ title: t('authenticator.wrongPass'), color: 'error' })
  } finally {
    busy.value = false
  }
}

watch(() => form.uri, (uri) => {
  if (!uri.startsWith('otpauth://')) return
  try {
    Object.assign(form, parseOtpauth(uri))
  } catch {
    toast.add({ title: t('authenticator.badUri'), color: 'error' })
  }
})

async function onAdd() {
  try {
    await totp(form.secret, form)
  } catch {
    toast.add({ title: t('authenticator.badSecret'), color: 'error' })
    return
  }
  await vault.add({
    issuer: form.issuer,
    name: form.name,
    secret: form.secret.replace(/\s/g, ''),
    period: form.period,
    digits: form.digits,
    algorithm: form.algorithm
  })
  Object.assign(form, { uri: '', issuer: '', name: '', secret: '', period: 30, digits: 6, algorithm: 'SHA-1' })
  addOpen.value = false
}

async function copy(id: string) {
  await navigator.clipboard.writeText(codes.value[id] ?? '')
  vault.touch()
  toast.add({ title: t('authenticator.copied'), icon: 'i-lucide-check', color: 'success' })
}

function parseVault(text: string): VaultFile {
  const data = JSON.parse(text)
  if (data?.v !== 1 || !data.salt || !data.iv || !data.data) throw new Error(t('authenticator.invalid'))
  return data
}
</script>

<template>
  <UCard class="mx-auto max-w-md">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="font-semibold text-highlighted">
            {{ t('authenticator.title') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('authenticator.description') }}
          </p>
        </div>
        <UButton
          v-if="unlocked"
          icon="i-lucide-lock"
          color="neutral"
          variant="outline"
          :label="t('authenticator.lock')"
          @click="vault.lock()"
        />
      </div>
    </template>

    <form
      v-if="!blob"
      class="space-y-4"
      @submit.prevent="onCreate"
    >
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="t('authenticator.noRecovery')"
      />
      <UFormField :label="t('authenticator.passphrase')">
        <UInput
          v-model="pass"
          type="password"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>
      <UFormField :label="t('authenticator.confirm')">
        <UInput
          v-model="pass2"
          type="password"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        block
        :loading="busy"
        :label="t('authenticator.create')"
      />
    </form>

    <form
      v-else-if="!unlocked"
      class="space-y-4"
      @submit.prevent="onUnlock"
    >
      <UFormField :label="t('authenticator.passphrase')">
        <UInput
          v-model="pass"
          type="password"
          autocomplete="current-password"
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        block
        :loading="busy"
        icon="i-lucide-lock-open"
        :label="t('authenticator.unlock')"
      />
    </form>

    <div
      v-else
      class="space-y-3"
    >
      <UEmpty
        v-if="!accounts.length"
        icon="i-lucide-shield-check"
        :title="t('authenticator.emptyTitle')"
        :description="t('authenticator.emptyDescription')"
      />

      <div
        v-for="a in accounts"
        :key="a.id"
        class="rounded-lg p-3 ring ring-default space-y-2"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-medium text-highlighted">
              {{ a.issuer || a.name }}
            </p>
            <p
              v-if="a.issuer"
              class="truncate text-sm text-muted"
            >
              {{ a.name }}
            </p>
          </div>
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="t('authenticator.remove')"
            @click="vault.remove(a.id)"
          />
        </div>

        <button
          type="button"
          class="w-full text-left text-3xl font-semibold tabular-nums tracking-wider text-highlighted transition active:scale-95"
          :aria-label="t('authenticator.copy')"
          @click="copy(a.id)"
        >
          {{ pretty(codes[a.id]) }}
        </button>

        <UProgress
          size="xs"
          :model-value="remaining(a.period)"
          :max="a.period"
          :color="remaining(a.period) <= 5 ? 'warning' : 'primary'"
        />
      </div>

      <UModal
        v-model:open="addOpen"
        :title="t('authenticator.addTitle')"
      >
        <UButton
          block
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          :label="t('authenticator.add')"
        />

        <template #body>
          <div class="space-y-4">
            <UFormField
              :label="t('authenticator.uri')"
              :hint="t('authenticator.uriHint')"
            >
              <UInput
                v-model="form.uri"
                placeholder="otpauth://totp/..."
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('authenticator.issuer')">
              <UInput
                v-model="form.issuer"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('authenticator.account')">
              <UInput
                v-model="form.name"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('authenticator.secret')">
              <UInput
                v-model="form.secret"
                autocomplete="off"
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-3 gap-3">
              <UFormField :label="t('authenticator.period')">
                <UInput
                  v-model.number="form.period"
                  type="number"
                  :min="1"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('authenticator.digits')">
                <UInput
                  v-model.number="form.digits"
                  type="number"
                  :min="6"
                  :max="8"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('authenticator.algorithm')">
                <USelect
                  v-model="form.algorithm"
                  :items="['SHA-1', 'SHA-256', 'SHA-512']"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              :label="t('authenticator.cancel')"
              @click="addOpen = false"
            />
            <UButton
              :label="t('authenticator.save')"
              @click="onAdd"
            />
          </div>
        </template>
      </UModal>
    </div>

    <template #footer>
      <SFileControls
        v-model="blob"
        :options="{ suggestedName: 'authenticator.vault.json', parse: parseVault }"
      />
    </template>
  </UCard>
</template>
