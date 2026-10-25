<script setup lang="ts">
import { useTransform, type MotionValue } from 'motion-v'

interface PinSlotProps {
  mv: MotionValue<number>
  drop: MotionValue<number>
  char?: string
  active?: boolean
  rise?: number
  sink?: number
}

const SINK_FADE = 0.6

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

const props = withDefaults(defineProps<PinSlotProps>(), {
  char: '',
  active: false,
  rise: 8,
  sink: 0
})

const shown = ref(props.char)

watch(() => props.char, (next) => {
  if (next && next !== shown.value) shown.value = next
})

const fill = useTransform(props.mv, (t: number) => `scale(${Math.max(t, 0)})`)

const lift = useTransform(
  [props.mv, props.drop] as MotionValue<number>[],
  ([t, d]: number[]) => `translateY(${(1 - t!) * props.rise + Math.max(d!, 0) * props.sink}px)`
)

const ink = useTransform(
  [props.mv, props.drop] as MotionValue<number>[],
  ([t, d]: number[]) => clamp01(t!) * (1 - clamp01(d! / SINK_FADE))
)
</script>

<template>
  <span
    class="relative h-(--ui-height) w-(--ui-size) overflow-hidden rounded-(--ui-radius) bg-primary/20 select-none transition-colors duration-200 data-active:bg-info/20 in-data-[status=error]:bg-error/20 in-data-[status=error]:data-active:bg-error/20 group-hover/row:in-data-[status=idle]:not-in-data-disabled:not-data-active:bg-secondary/20"
    :data-active="active ? '' : undefined"
    :data-filled="char ? '' : undefined"
    aria-hidden="true"
  >
    <Motion
      as="span"
      class="absolute inset-0 origin-center rounded-[inherit] bg-inverted transition-colors duration-200 in-data-[status=error]:bg-error"
      :style="{ transform: fill }"
    />
    <Motion
      v-if="shown"
      as="span"
      class="absolute inset-0 z-2 grid place-items-center text-(length:--ui-font) leading-none font-semibold tabular-nums text-inverted motion-reduce:transform-none! motion-reduce:transition-opacity motion-reduce:duration-150"
      :style="{ transform: lift, opacity: ink }"
    >
      {{ shown }}
    </Motion>
  </span>
</template>
