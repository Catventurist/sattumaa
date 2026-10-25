<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{ editor: Editor, attrs: { language: 'mdc' } }>()
const { t } = useI18n()

function insert(snippet: string) {
  props.editor
    .chain()
    .focus()
    .insertContent({
      type: 'codeBlock',
      attrs: { language: 'md' },
      content: [{ type: 'text', text: snippet }]
    })
    .run()
}

const items = computed(() => [[
  { label: t('editor.mdc.chart'), icon: 'i-lucide-chart-column', onSelect: () => insert(mdcSnippets.chart) },
  { label: t('editor.mdc.timeline'), icon: 'i-lucide-history', onSelect: () => insert(mdcSnippets.timeline) },
  { label: t('editor.mdc.progressGroup'), icon: 'i-lucide-gauge', onSelect: () => insert(mdcSnippets.progressGroup) }
]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :modal="false"
    :content="{ align: 'end' }"
  >
    <UTooltip :text="t('editor.components')">
      <UButton
        icon="i-lucide-blocks"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="!editor?.isEditable"
      />
    </UTooltip>
  </UDropdownMenu>
</template>
