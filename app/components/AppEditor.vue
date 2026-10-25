<script setup lang="ts">
import type {
  EditorToolbarItem,
  EditorSuggestionMenuItem,
  EditorMentionMenuItem
  /* EditorEmojiMenuItem */
} from '@nuxt/ui'

import { TextAlign } from '@tiptap/extension-text-align'
/* import { Emoji, gitHubEmojis } from '@tiptap/extension-emoji' */

const { t } = useI18n()
const emit = defineEmits<{ download: [] }>()
const value = defineModel<string>({ default: '' })

const headings = computed(() => [1, 2, 3, 4].map(level => ({
  kind: 'heading' as const,
  level,
  icon: `i-lucide-heading-${level}`,
  label: t('editor.heading', { level })
})))

const fixedItems = computed<EditorToolbarItem[][]>(() => [
  [
    { kind: 'undo', icon: 'i-lucide-undo', tooltip: { text: t('editor.undo') } },
    { kind: 'redo', icon: 'i-lucide-redo', tooltip: { text: t('editor.redo') } }
  ],
  [{
    icon: 'i-lucide-heading',
    tooltip: { text: t('editor.headings') },
    content: { align: 'start' },
    items: headings.value
  }, {
    icon: 'i-lucide-list',
    tooltip: { text: t('editor.lists') },
    content: { align: 'start' },
    items: [
      { kind: 'bulletList', icon: 'i-lucide-list', label: t('editor.bulletList') },
      { kind: 'orderedList', icon: 'i-lucide-list-ordered', label: t('editor.orderedList') }
    ]
  },
  { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: t('editor.blockquote') } },
  { kind: 'codeBlock', icon: 'i-lucide-square-code', tooltip: { text: t('editor.codeBlock') } },
  { kind: 'horizontalRule', icon: 'i-lucide-separator-horizontal', tooltip: { text: t('editor.divider') } }],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: t('editor.bold') } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: t('editor.italic') } },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: t('editor.underline') } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: t('editor.strike') } },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: t('editor.code') } }
  ],
  [
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: t('editor.link') } },
    { kind: 'image', icon: 'i-lucide-image', tooltip: { text: t('editor.image') } }
  ],
  [{
    icon: 'i-lucide-align-justify',
    tooltip: { text: t('editor.textAlign') },
    content: { align: 'end' },
    items: (['left', 'center', 'right', 'justify'] as const).map(align => ({
      kind: 'textAlign' as const,
      align,
      icon: `i-lucide-align-${align}`,
      label: t(`editor.align.${align}`)
    }))
  }],
  [{ slot: 'mdc' as const }],
  [{
    icon: 'i-lucide-download',
    tooltip: { text: t('editor.download') },
    onClick: () => emit('download')
  }]
])

const suggestionItems = computed<EditorSuggestionMenuItem[][]>(() => [
  [
    { type: 'label', label: t('editor.suggestion.style') },
    { kind: 'paragraph', label: t('editor.paragraph'), icon: 'i-lucide-type' },
    ...[1, 2, 3].map(level => ({
      kind: 'heading' as const,
      level,
      icon: `i-lucide-heading-${level}`,
      label: t('editor.heading', { level })
    })),
    { kind: 'bulletList', label: t('editor.bulletList'), icon: 'i-lucide-list' },
    { kind: 'orderedList', label: t('editor.orderedList'), icon: 'i-lucide-list-ordered' },
    { kind: 'blockquote', label: t('editor.blockquote'), icon: 'i-lucide-text-quote' },
    { kind: 'codeBlock', label: t('editor.codeBlock'), icon: 'i-lucide-square-code' }
  ],
  [
    { type: 'label', label: t('editor.suggestion.insert') },
    { kind: 'mention', label: t('editor.mention'), icon: 'i-lucide-at-sign' },
    /* { kind: 'emoji', label: t('editor.emoji'), icon: 'i-lucide-smile-plus' }, */
    { kind: 'horizontalRule', label: t('editor.divider'), icon: 'i-lucide-separator-horizontal' }
  ]
])

const bubbleItems: EditorToolbarItem[][] = [
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline' },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code' }
  ],
  [{ kind: 'link', icon: 'i-lucide-link' }]
]

const mentionItems: EditorMentionMenuItem[] = [
  { label: 'light', avatar: { src: '/catbirch.webp', loading: 'lazy', width: 24, height: 24 } },
  { label: 'dark', avatar: { src: '/catbirchdark.webp', loading: 'lazy', width: 24, height: 24 } }
]

/* const emojiItems: EditorEmojiMenuItem[] = gitHubEmojis
  .filter((emoji: { name: string }) => !emoji.name.startsWith('regional_indicator_')) */
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="value"
    content-type="markdown"
    :placeholder="t('editor.placeholder')"
    :extensions="[
      /* Emoji, */
      TextAlign.configure({ types: ['heading', 'paragraph'] })
    ]"
    :ui="{ base: 'p-8 sm:px-16 py-13.5' }"
    class="w-full"
  >
    <UEditorToolbar
      :editor="editor"
      :items="fixedItems"
      class="border-b border-muted sticky top-0 inset-x-0 px-8 sm:px-16 py-2 z-50 bg-default/80 overflow-x-auto"
    >
      <template #mdc>
        <MarkInsertMenu
          :attrs="{ language: 'mdc' }"
          :editor="editor"
        />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      :editor="editor"
      :items="bubbleItems"
      layout="bubble"
      :should-show="({ view, state }) => view.hasFocus() && !state.selection.empty"
    />

    <UEditorSuggestionMenu
      :editor="editor"
      :items="suggestionItems"
    />
    <UEditorMentionMenu
      :editor="editor"
      :items="mentionItems"
    />
    <!-- <UEditorEmojiMenu
      :editor="editor"
      :items="emojiItems"
    /> -->
    <UEditorDragHandle :editor="editor" />
  </UEditor>
</template>
