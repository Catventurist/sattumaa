<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { useLocalStorage } from '@vueuse/core'

interface BatchItem {
  merchant: string
  token: string
  serial: string
  value: number
}

defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const MERCHANTS = ['shopA', 'shopB']

const STATUS_COLORS = {
  'credited': 'success',
  'double-spend': 'error',
  'expired': 'warning',
  'invalid': 'error'
} as const

const { t } = useI18n()
const { salt, fingerprint, mint, verify, rotate } = useKiosk()
const { balances, submit, reset: resetLedger } = useKioskServer()

const tab = ref('mint')
const online = ref(true)
const value = ref(10)
const days = ref(0)
const busy = ref(false)
const input = ref('')
const checked = ref<VerifyResult | null>(null)
const merchant = ref('shopA')
const results = ref<ReconcileResult[]>([])

const minted = useLocalStorage<MintedToken | null>('win:kiosk:minted', null, { initOnMounted: true })
const batch = useLocalStorage<BatchItem[]>('win:kiosk:batch', [], { initOnMounted: true })

const tabs = computed<TabsItem[]>(() => [
  { label: t('kiosk.tabMint'), icon: 'i-lucide-stamp', value: 'mint' },
  { label: t('kiosk.tabVerify'), icon: 'i-lucide-scan-line', value: 'verify' },
  { label: t('kiosk.tabReconcile'), icon: 'i-lucide-refresh-cw', value: 'reconcile' },
  { label: t('kiosk.tabNotes'), icon: 'i-lucide-lock-keyhole', value: 'notes' }
])

const merchantItems = computed(() => MERCHANTS.map(id => ({ label: t(`kiosk.merchants.${id}`), value: id })))
const mine = computed(() => batch.value.filter(item => item.merchant === merchant.value))

async function issue() {
  busy.value = true
  try {
    minted.value = await mint(Math.max(1, Number(value.value) || 1), Math.max(0, Number(days.value) || 0))
  } finally {
    busy.value = false
  }
}

function pasteLatest() {
  if (minted.value) input.value = minted.value.jwt
}

async function check() {
  checked.value = await verify(input.value)
}

function accept() {
  const result = checked.value
  if (!result?.ok) return
  batch.value = [...batch.value, { merchant: merchant.value, token: input.value.trim(), serial: result.serial, value: result.value }]
}

async function reconcile() {
  results.value = await submit(merchant.value, mine.value.map(item => item.token))
  batch.value = batch.value.filter(item => item.merchant !== merchant.value)
}

function resetAll() {
  resetLedger()
  batch.value = []
  results.value = []
}
</script>

<template>
  <MWindow
    :open="open"
    :title="t('kiosk.title')"
    icon="i-lucide-ticket"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0 flex-col">
      <div class="flex items-center gap-2 border-b border-default p-2">
        <UTabs
          v-model="tab"
          :items="tabs"
          :content="false"
          class="flex-1"
        />
        <USwitch
          v-model="online"
          :label="t('kiosk.online')"
          size="xs"
        />
      </div>

      <div class="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        <template v-if="tab === 'mint'">
          <div class="grid gap-3 sm:grid-cols-3">
            <UFormField :label="t('kiosk.value')">
              <UInputNumber
                v-model="value"
                :min="1"
              />
            </UFormField>
            <UFormField
              :label="t('kiosk.expiry')"
              :description="t('kiosk.expiryHint')"
            >
              <UInputNumber
                v-model="days"
                :min="0"
              />
            </UFormField>
            <UFormField :label="t('kiosk.salt')">
              <UInput v-model="salt" />
            </UFormField>
          </div>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-stamp"
              :label="t('kiosk.mint')"
              color="info"
              :loading="busy"
              @click="issue"
            />
            <UButton
              icon="i-lucide-key-round"
              :label="t('kiosk.newKey')"
              color="neutral"
              variant="outline"
              @click="rotate"
            />
          </div>
          <MKioskSlip
            v-if="minted?.jwt"
            :token="minted"
            :salt="salt"
            :fingerprint="fingerprint"
          />
          <p
            v-else
            class="text-sm text-muted"
          >
            {{ t('kiosk.noPaper') }}
          </p>
        </template>

        <template v-else-if="tab === 'verify'">
          <UTextarea
            v-model="input"
            :rows="4"
            :placeholder="t('kiosk.paste')"
            class="w-full font-mono"
          />
          <div class="flex flex-wrap gap-2">
            <UButton
              icon="i-lucide-scan-line"
              :label="t('kiosk.verify')"
              color="info"
              :disabled="!input.trim()"
              @click="check"
            />
            <UButton
              icon="i-lucide-clipboard-paste"
              :label="t('kiosk.useLatest')"
              color="neutral"
              variant="outline"
              :disabled="!minted"
              @click="pasteLatest"
            />
          </div>
          <UAlert
            v-if="checked && !checked.ok"
            color="error"
            variant="soft"
            icon="i-lucide-shield-x"
            :title="t(`kiosk.reasons.${checked.reason}`)"
          />
          <div
            v-else-if="checked?.ok"
            class="space-y-3 rounded-sm border border-success/25 bg-success/10 p-3 text-sm"
          >
            <p class="flex items-center gap-2 font-bold text-success">
              <UIcon
                name="i-lucide-shield-check"
                class="size-4"
              />
              {{ t('kiosk.valid') }}
            </p>
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt class="text-muted">
                {{ t('kiosk.serial') }}
              </dt>
              <dd class="font-mono">
                {{ checked.serial }}
              </dd>
              <dt class="text-muted">
                {{ t('kiosk.worth') }}
              </dt>
              <dd>{{ checked.value }} {{ t('kiosk.units') }}</dd>
              <dt class="text-muted">
                {{ t('kiosk.note') }}
              </dt>
              <dd class="italic">
                {{ checked.note.join(' / ') }}
              </dd>
            </dl>
            <div class="flex items-center gap-2">
              <USelect
                v-model="merchant"
                :items="merchantItems"
                class="w-40"
              />
              <UButton
                icon="i-lucide-plus"
                :label="t('kiosk.accept')"
                color="success"
                variant="soft"
                @click="accept"
              />
            </div>
          </div>
        </template>

        <template v-else-if="tab === 'reconcile'">
          <div class="flex flex-wrap items-center gap-2">
            <USelect
              v-model="merchant"
              :items="merchantItems"
              class="w-40"
            />
            <UButton
              icon="i-lucide-refresh-cw"
              :label="t('kiosk.reconcile')"
              color="info"
              :disabled="!online || !mine.length"
              @click="reconcile"
            />
            <UButton
              icon="i-lucide-trash-2"
              :label="t('kiosk.resetLedger')"
              color="neutral"
              variant="ghost"
              @click="resetAll"
            />
          </div>
          <UAlert
            v-if="!online"
            color="warning"
            variant="soft"
            icon="i-lucide-wifi-off"
            :title="t('kiosk.offlineNotice')"
          />

          <section>
            <h3 class="mb-1 text-sm font-bold">
              {{ t('kiosk.batch') }}
            </h3>
            <p
              v-if="!mine.length"
              class="text-sm text-muted"
            >
              {{ t('kiosk.emptyBatch') }}
            </p>
            <ul
              v-else
              class="space-y-1"
            >
              <li
                v-for="(item, i) in mine"
                :key="`${item.serial}-${i}`"
                class="flex justify-between rounded-sm bg-elevated/40 px-3 py-1.5 text-sm"
              >
                <span class="font-mono">{{ item.serial }}</span>
                <span>{{ item.value }} {{ t('kiosk.units') }}</span>
              </li>
            </ul>
          </section>

          <section v-if="results.length">
            <h3 class="mb-1 text-sm font-bold">
              {{ t('kiosk.results') }}
            </h3>
            <ul class="space-y-1">
              <li
                v-for="(result, i) in results"
                :key="`${result.serial}-${i}`"
                class="flex items-center justify-between rounded-sm bg-elevated/40 px-3 py-1.5 text-sm"
              >
                <span class="font-mono">{{ result.serial }}</span>
                <UBadge
                  :color="(STATUS_COLORS[result.status] as color)"
                  variant="subtle"
                  :label="t(`kiosk.status.${result.status}`)"
                />
              </li>
            </ul>
          </section>

          <section>
            <h3 class="mb-1 text-sm font-bold">
              {{ t('kiosk.balances') }}
            </h3>
            <ul class="space-y-1">
              <li
                v-for="id in MERCHANTS"
                :key="id"
                class="flex justify-between rounded-sm bg-elevated/40 px-3 py-1.5 text-sm"
              >
                <span>{{ t(`kiosk.merchants.${id}`) }}</span>
                <span class="font-mono">{{ balances[id] ?? 0 }} {{ t('kiosk.units') }}</span>
              </li>
            </ul>
          </section>
        </template>

        <MKioskNotes
          v-else
          :serial="minted?.serial"
          :online="online"
        />
      </div>
    </div>
  </MWindow>
</template>
