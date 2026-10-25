<script setup lang="ts">
interface Obligation {
  id: number
  base: string
  depth: number
  done: boolean
}

const { t } = useI18n()

const text = ref('')
const log = ref<string[]>([])
const obligations = ref<Obligation[]>([])
const lifetime = ref(0)
const wasPlatform = ref(false)
const vlop = ref(false)

let since = 0
let nextId = 0

const baseKeys = ['tos', 'complaint', 'report', 'notice']

const isPlatform = computed(() => text.value.trim().length > 0)
const state = computed(() => isPlatform.value ? 'platform' : wasPlatform.value ? 'former' : 'static')
const color = computed(() => ({ static: 'success', platform: 'error', former: 'warning' }[state.value] as 'success' | 'error' | 'warning'))

const done = computed(() => obligations.value.filter(o => o.done).length)
const progress = computed(() => obligations.value.length ? Math.round(done.value / obligations.value.length * 100) : 0)

function add(base: string, depth = 0) {
  obligations.value.push({ id: nextId++, base, depth, done: false })
  lifetime.value++
}

function labelOf(o: Obligation) {
  const name = t(`schrodinger.obligations.${o.base}`)
  return o.depth === 0 ? name : t('schrodinger.followup', { depth: o.depth, name })
}

function complete(o: Obligation) {
  if (o.done) return
  o.done = true
  add(o.base, o.depth + 1)
}

watch(isPlatform, (now) => {
  if (now) {
    since = Date.now()
    if (!wasPlatform.value) {
      wasPlatform.value = true
      baseKeys.forEach(key => add(key))
    }
    return
  }
  const seconds = ((Date.now() - since) / 1000).toFixed(1)
  log.value = [t('schrodinger.log', { seconds }), ...log.value].slice(0, 5)
})

watch(() => text.value.length >= 280, (big) => {
  if (big && !vlop.value) {
    vlop.value = true
    add('audit')
    add('risk')
  }
})
</script>

<template>
  <MotionConfig reduced-motion="user">
    <div class="flex flex-col min-w-100 gap-4">
      <UTextarea
        id="platform-text"
        v-model="text"
        autocomplete="off"
        :placeholder="t('schrodinger.placeholder')"
        :aria-label="t('schrodinger.label')"
        autoresize
      />

      <div class="flex flex-wrap items-center gap-3">
        <AnimatePresence mode="wait">
          <Motion
            :key="state"
            as="span"
            :initial="{ opacity: 0, scale: 0.8 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.8 }"
            :transition="{ duration: 0.15 }"
          >
            <UBadge
              :label="t(`schrodinger.state.${state}`)"
              :color="color"
              variant="subtle"
              size="lg"
            />
          </Motion>
        </AnimatePresence>

        <UBadge
          v-if="vlop"
          :label="t('schrodinger.vlop')"
          color="error"
          variant="solid"
        />
        <UBadge
          v-if="lifetime"
          :label="t('schrodinger.lifetime', { count: lifetime })"
          color="neutral"
          variant="outline"
        />
      </div>

      <p
        role="status"
        class="text-sm text-muted"
      >
        {{ t(`schrodinger.hint.${state}`) }}
      </p>

      <UAlert
        v-if="state === 'former'"
        :title="t('schrodinger.retention.title')"
        :description="t('schrodinger.retention.description')"
        icon="i-lucide-archive"
        color="warning"
        variant="subtle"
      />

      <UProgress
        v-if="obligations.length"
        :model-value="progress"
      />

      <ul class="flex flex-col gap-2">
        <AnimatePresence>
          <Motion
            v-for="(o, i) in obligations"
            :key="o.id"
            as="li"
            :initial="{ opacity: 0, y: -8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -8 }"
            :transition="{ delay: Math.min(i, 5) * 0.06 }"
          >
            <UCheckbox
              :id="`obligation-${o.id}`"
              :name="`obligation-${o.id}`"
              :model-value="o.done"
              :disabled="o.done"
              :label="labelOf(o)"
              @update:model-value="complete(o)"
            />
          </Motion>
        </AnimatePresence>
      </ul>

      <ul
        v-if="log.length"
        class="text-sm text-muted"
      >
        <li
          v-for="(entry, i) in log"
          :key="i"
        >
          {{ entry }}
        </li>
      </ul>
    </div>
  </MotionConfig>
</template>
