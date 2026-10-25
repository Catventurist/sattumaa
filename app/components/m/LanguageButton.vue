<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

const { t, locale, locales, setLocale } = useI18n()

const codes = computed(() => locales.value.map(entry => typeof entry === 'string' ? entry : entry.code))

function cycle() {
  const list = codes.value
  const next = list[(list.indexOf(locale.value) + 1) % list.length]
  if (next) setLocale(next)
}
</script>

<template>
  <UButton
    :aria-label="t('settings.language')"
    color="neutral"
    variant="link"
    size="xs"
    class="text-inverted"
    @click="cycle"
  >
    <AnimatePresence
      mode="wait"
      :initial="false"
    >
      <motion.span
        :key="locale"
        :initial="{ rotateX: -90, opacity: 0, transformPerspective: 200 }"
        :animate="{ rotateX: 0, opacity: 1, transformPerspective: 200 }"
        :exit="{ rotateX: 90, opacity: 0, transformPerspective: 200 }"
        :transition="{ duration: 0.12, ease: 'easeInOut' }"
        class="inline-block"
      >
        {{ locale.toUpperCase() }}
      </motion.span>
    </AnimatePresence>
  </UButton>
</template>
