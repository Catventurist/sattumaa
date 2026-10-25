<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

defineProps<NodeViewProps>()

const components: Record<string, unknown> = {
  'u-chart': resolveComponent('UChart'),
  'u-timeline': resolveComponent('UTimeline'),
  'u-progress-group': resolveComponent('UProgressGroup')
}
</script>

<template>
  <NodeViewWrapper
    contenteditable="false"
    class="rounded-md border border-muted p-4"
    :class="{ 'ring-2 ring-primary': selected }"
  >
    <component
      :is="components[node.attrs.component]"
      v-bind="node.attrs.props"
    />
  </NodeViewWrapper>
</template>
