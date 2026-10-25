<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  token: MintedToken
  salt: string
  fingerprint: string
}>()

const { t, locale } = useI18n()
const { copy, copied } = useClipboard()

const dark = computed(() => pseudoQr(props.token.jwt).flatMap((row, y) =>
  row.flatMap((on, x) => on ? [{ x, y }] : [])
))

const expires = computed(() => props.token.expiresAt
  ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(props.token.expiresAt))
  : t('kiosk.never'))
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <div class="flex flex-col gap-2 rounded-sm border-2 border-dashed border-accented bg-default p-3">
      <div class="flex items-baseline justify-between">
        <span class="text-3xl font-bold text-info">{{ token.value }}</span>
        <span class="text-xs text-muted uppercase">{{ t('kiosk.units') }}</span>
      </div>
      <svg
        viewBox="0 0 25 25"
        shape-rendering="crispEdges"
        class="mx-auto size-36 rounded-sm border border-default bg-default text-highlighted"
        role="img"
        :aria-label="t('kiosk.qrNote')"
      >
        <rect
          v-for="cell in dark"
          :key="`${cell.x}-${cell.y}`"
          :x="cell.x"
          :y="cell.y"
          width="1"
          height="1"
          fill="currentColor"
        />
      </svg>
      <p class="text-center text-xs text-muted">
        {{ t('kiosk.qrNote') }}
      </p>
      <p class="text-center font-mono text-sm tracking-wider">
        {{ token.serial }}
      </p>
      <p class="text-center text-xs text-muted italic">
        <span
          v-for="line in token.note"
          :key="line"
          class="block"
        >
          {{ line }}
        </span>
      </p>
      <p class="text-center text-xs text-muted">
        {{ t('kiosk.expires') }}: {{ expires }}
      </p>
      <UButton
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        :label="copied ? t('kiosk.copied') : t('kiosk.copy')"
        color="neutral"
        variant="outline"
        size="xs"
        @click="copy(token.jwt)"
      />
    </div>

    <div class="flex flex-col justify-between gap-3 rounded-sm border-2 border-dashed border-accented bg-default p-3 text-xs">
      <p class="font-bold">
        {{ t('kiosk.bearer') }}
      </p>
      <dl class="space-y-2">
        <div>
          <dt class="text-muted">
            {{ t('kiosk.saltLabel') }}
          </dt>
          <dd class="font-mono">
            {{ salt }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('kiosk.keyLabel') }}
          </dt>
          <dd class="font-mono break-all">
            {{ fingerprint }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
