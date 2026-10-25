<template>
  <SWarmTooltipGroup
    :delay="400"
    :warm-window="300"
    :travel="320"
    :lean="0"
    class="flex flex-row gap-2 h-8"
  >
    <SWarmTooltip
      v-slot="{ describedby }"
      content="Bold"
      shortcut="⌘ B"
    >
      <UButton :aria-describedby="describedby">
        B
      </UButton>
    </SWarmTooltip>
    <SWarmTooltip
      v-slot="{ describedby }"
      content="Italic"
      shortcut="⌘ I"
      side="right"
    >
      <UButton :aria-describedby="describedby">
        I
      </UButton>
    </SWarmTooltip>
  </SWarmTooltipGroup>
</template>
