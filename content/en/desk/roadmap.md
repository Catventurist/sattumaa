---
title: Roadmap
description: Fixes, features and ideas for a Win desktop UI built with Nuxt 4, Nuxt UI, Nuxt i18n and motion-v.
navigation: 
  icon: i-lucide-map
---

::callout{icon="i-lucide-info" color="info"}
Components live in `app/components/m/`. Messages live in `en.yml` and `fi.yml`.
::

## Fix

::card-group
  :::card{title="JitsiWindow" icon="i-lucide-video"}
  Handle the state where there is no room yet.
  :::

  :::card{title="MediaPlayer" icon="i-lucide-play"}
  Fix: the play() request was interrupted by a call to pause().
  :::

  :::card{title="PageState" icon="i-lucide-layout"}
  Persist layout, sidebars and other page state.
  :::

  :::card{title="CSS" icon="i-lucide-paintbrush"}
  ColorPicker, PinSlots, RefineFrame and Error.
  :::
::


::callout{icon="i-lucide-sparkles" color="success"}
New: `useWindows`, `win.vue` and `StartMenu.vue`.
::

### Pretty heavy

- Increased memory use: Clock, Sheet, MusicPlayer, Gallery
- Charts, Graphs, Kiosk

### Id label

- ELinkList with `:bookmarks="mockBookmarks"` searches
- ContentSearch

## Maybe

::tabs
  :::tabs-item{label="Apps" icon="i-lucide-app-window"}
  - OGImage
  - EditorSidebar
  - Dictionary
  - Calculator
  - Command Prompt
  - Task Manager
  - System Information
  - Help viewer (F1)
  - Event log
  :::

  :::tabs-item{label="MSheet" icon="i-lucide-table"}
  - Copy, paste and fill
  - More functions: CONCAT, LEN, TODAY, AND and OR
  :::

  :::tabs-item{label="MPaint" icon="i-lucide-brush"}
  - Fill bucket
  - Line tools
  :::

  :::tabs-item{label="Desktop" icon="i-lucide-monitor"}
  - Desktop icons for the main apps and the bin. Select on click, launch on double click, reading from `useFileSystem`.
  - A `UContextMenu` on empty desktop space: new folder, new note, wallpaper, settings.
  - Connect the fix-it queue to `useBoard`, with card details in a `USlideover`.
  :::
::

### Complicated

::badge{color="warning" variant="subtle"}
Large scope
::

- Image editing
- Video editing
- Email
- File sharing
- Abanico

### Games

- Minesweeper
- Solitaire
- FreeCell
- Spider Solitaire
- Hearts
- 3D Pinball (Space Cadet, Maze Madness, Beast)

## Bun & Vercel

- .github/workflows/ci.yml `with: bun-version: 1.4.x`
- package.json `"packageManager": "bun@1.4.4"`
- vercel.json `"bunVersion": "1.4.x"`

## Dev notes

::accordion
  :::accordion-item{label="Stack and setup" icon="i-lucide-layers"}
  - [Nuxt](https://nuxt.com/) auto-imports Vue APIs, composables and components, so don't write import statements for them.
  - [motion-v](https://motion.unovue.com/) is registered via the `motion-v/nuxt` module. Use `<Motion as="div">` and `<AnimatePresence>`, not framer-motion.
  - [Install packages](https://bun.com/) with `bun add`.
  :::

  :::accordion-item{label="i18n" icon="i-lucide-languages"}
  - [Locale files](https://i18n.nuxtjs.org/) are `i18n/locales/en.yml` and `fi.yml`.
  - Use single quotes in YAML only when necessary, for example for values containing ": " or starting with `{`.
  - Use `const { t } = useI18n()` in `<script setup lang="ts">`.
  - Translate UI labels. Keep user-editable data untranslated.
  :::

  :::accordion-item{label="Nuxt UI conversions" icon="i-lucide-replace"}
  - Use semantic colors and classes (`text-muted`, `text-highlighted`, `border-default`, `bg-elevated`, `text-success`). Don't use `dark:` variants.
  - Avoid dynamic [Tailwind class names](https://tailwindcss.com/) such as `bg-${color}`. Use a static class map.
  :::

  :::accordion-item{label="Accessibility" icon="i-lucide-accessibility"}
  - UFormField's label `for` only works with controls that register an id (UInput, USelect, UTextarea, USwitch). It does not work with UButton triggers, USlider or custom inputs.
  - For those, skip the `label` prop and use your own `<span id="x-label">` with `aria-labelledby`.
  - Custom or hidden inputs (like OTP inputs) need `id`, `name` and a matching label.
  - Check every new form field for a matching label `for` and `id`.
  :::
::
