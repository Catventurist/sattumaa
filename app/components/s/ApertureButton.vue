<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  icon?: string
  size?: number
}>(), {
  size: 140
})

const blades = 8

const bladeVariants = {
  rest: {
    '--pivot-y': '137%',
    '--x': '33.3%',
    'transition': { type: 'tween', duration: 0.18, ease: 'easeOut' }
  },
  hover: {
    '--pivot-y': '133%',
    '--x': '32%',
    'transition': { type: 'tween', duration: 0.18, ease: 'easeOut' }
  },
  press: {
    '--pivot-y': '101.3%',
    '--x': '25.3%',
    'transition': { type: 'tween', duration: 0.1, ease: 'easeOut' }
  }
}

const labelVariants = {
  rest: { opacity: 0.55 },
  hover: { opacity: 1 },
  press: { opacity: 1 }
}
</script>

<template>
  <Motion
    as-child
    initial="rest"
    animate="rest"
    while-hover="hover"
    while-press="press"
  >
    <UButton
      color="info"
      variant="link"
      :icon="icon"
      :style="{ '--size': `${size}px` }"
      :ui="{ base: 'p-0 gap-0 rounded-full hover:no-underline' }"
      class="isolate group/btn relative flex size-(--size) items-center justify-center rounded-full"
    >
      <div
        class="pointer-events-none absolute left-1/2 top-1/2 size-[calc(var(--size)*4)] -translate-x-1/2 -translate-y-1/2 mask-circle mask-radial-[calc(var(--size)/2)] mask-radial-at-center mask-radial-from-[calc(100%-1px)]"
      >
        <div class="pointer-events-none absolute left-1/2 top-1/2 size-(--size) -translate-x-1/2 -translate-y-1/2">
          <div
            v-for="i in blades"
            :key="i"
            :style="{ '--i': i - 1 }"
            class="pointer-events-none absolute inset-0 drop-shadow-sm drop-shadow-primary"
          >
            <Motion
              :variants="bladeVariants"
              class="pointer-events-none absolute size-full origin-[50%_var(--pivot-y)] rotate-[calc(var(--i)*45deg)] bg-accented top-[calc(50%-var(--pivot-y))] [--pivot-y:137%] [--x:33.3%] mask-linear-45 mask-linear-from-(--x) mask-linear-to-(--x)"
            />
          </div>
        </div>
      </div>

      <div class="pointer-events-none absolute inset-1.75 rounded-full inset-shadow-sm inset-shadow-primary" />

      <Motion
        as="span"
        :variants="labelVariants"
        :transition="{ duration: 0.25 }"
        class="pointer-events-none relative -z-10 text-2xl font-semibold"
      >
        <slot :label="label">
          {{ label }}
        </slot>
      </Motion>

      <div
        class="pointer-events-none absolute inset-0 z-3 rounded-full ring-8 ring-inset ring-default duration-300 group-hover/btn:ring-muted"
      />
    </UButton>
  </Motion>
</template>
