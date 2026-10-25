---
title: User Interface
description: Information about the Win interface.
navigation: 
  icon: i-lucide-hand
layout: docs
---

A retro [desktop](/win) in the browser, with draggable windows, a taskbar, a start menu and a set of small apps. It is built with Nuxt 4, Nuxt UI, `@nuxtjs/i18n` and motion-v, and it speaks English and Finnish.

::callout{icon="i-lucide-info" color="info"}
Everything is client-side. State lives in `useState` and local storage, so there is no backend to run.
::

## Add a new app

::steps{level="3"}
### Register the window

Add the key to `WinKey` and `WIN_KEYS` in `useWin`, and give it a default state of `closed`.

### Describe it in the start menu

Add an entry to `START_APPS` with an icon and a label key under `taskbar.apps`.

### Render it in the layout

Copy an existing block in `win.vue` and swap the key. It needs `open`, `constraints`, a z-index, focus, minimize and close.

### Add the messages

Add the keys to both `en.yml` and `fi.yml`. A missing key shows up as a warning in the console.
::

## Composables

| Composable | What it does |
|---|---|
| `useWin` | Window states, focus order, z-index and launching apps |
| `useSettings` | Accent, wallpaper, taskbar and music options in local storage |
| `useFileSystem` | Seed nodes plus a saved overlay, with a recycle bin |
| `useFileOpen` | File associations and the hand-off between apps |
| `usePlayer` | The shared media queue |
| `useGallery` | Picture order and the selected image |
| `useAlarms` | Saved alarms and the background watcher |

::::field-group
:::field{name="states" type="Record<WinKey, WinState>"}
Each window is `closed`, `open` or `minimized`. The layout renders a window while its state is not `closed`.
:::

:::field{name="launch" type="(key: string) => void"}
Opens a window by key and ignores unknown keys. The special key `shutDown` closes everything.
:::

:::field{name="toggle" type="(key: WinKey) => void"}
Minimizes the focused window, or opens and focuses it otherwise.
:::
::::

## Languages

::::tabs
:::tabs-item{label="English" icon="i-lucide-languages"}
Messages live in `en.yml`. Keys use dot paths such as `clock.title`.
:::

:::tabs-item{label="Finnish" icon="i-lucide-languages"}
Messages live in `fi.yml` and mirror the English keys one to one.
:::
::::

### Start

```bash
bun i
bun dev
bun run typecheck
bun run lint --fix
bunx nuxi cleanup
bun update
bun upgrade
bun run build
bun run build --analyze
bun run preview
```

## Conventions

::::accordion
:::accordion-item{label="Code style" icon="i-lucide-code"}
ESLint stylistic: no semicolons, single quotes and one interface member per line. No code comments.
:::

:::accordion-item{label="Colors" icon="i-lucide-palette"}
Semantic colors only (`info`, `success`, `warning`, `error`, `neutral`) with opacity modifiers, so every app follows the accent.
:::

:::accordion-item{label="Components" icon="i-lucide-box"}
Components live in `app/components/m/` and are named `MName`. Props and function names must not clash, to keep `vue/no-dupe-keys` quiet.
:::
::::

## Future

Planned shortcuts: :kbd{value="meta"} :kbd{value="k"} opens the command palette and :kbd{value="alt"} :kbd{value="tab"} switches windows.

::collapsible{name="planned" label="Planned"}
- Window snapping
- Desktop icons and a right-click menu
- Explorer cut, copy, paste and multi-select
- Notification center and a terminal
- Screensavers
- Dictionary
- Calculator
- Command Prompt
- Task Manager
- System Information
- Advanced
  - Image editing
  - Video editing
  - Email
  - File sharing
::
