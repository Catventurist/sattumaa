---
title: Editor guide
description: Write and format content, and insert components.
navigation:
  icon: i-lucide-pencil-line
layout: docs
---

## Basics

Write in the [editor](/edit) like in any text editor. Formatting is saved as markdown.

Use the toolbar at the top for headings, lists, quotes, code blocks, links, images and text alignment. Select text to get a small formatting toolbar next to it.

Common shortcuts: :kbd{value="meta"} :kbd{value="B"} for bold and :kbd{value="meta"} :kbd{value="I"} for italic.

## Quick insert

Type a trigger character on an empty line or after a space:

- `/` opens the command menu for headings, lists, quotes and other blocks.
- `@` opens the mention menu.

Keep typing to filter the list, use the arrow keys to move, and press `Enter` to pick an item or `Escape` to close.

## Moving blocks

Hover over the left side of a block to show the drag handle. Drag it to reorder blocks.

## Components

Use the **Insert component** button in the toolbar to add a chart, timeline or progress group. The snippet appears as a code block that you can edit.

Edit the values in the YAML, keeping the `::` lines and the `---` lines in place.

::note
Components are shown as code in the editor. They turn into real components when you download the file.
::

## Saving

Your content is saved automatically in this browser a moment after you stop typing. It stays there if you reload the page.

Use **Download** to get a `.md` file. Component snippets are exported as plain MDC, without the code fence.

Use **Clear** button on bottom right to empty the editor and remove the saved copy. This can't be undone.

## Tips

- Saved content lives in your browser only. Download a file if you need a backup or want to share it.
- Different browsers and devices don't share saved content.
