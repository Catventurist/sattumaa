---
title: Site
description: What Sattuma is, the components behind it and the editor.
navigation:
  icon: i-lucide-info
layout: default
---

::u-page-hero
---
headline: About
title: Sattumaa
description: A Nuxt app with rich markdown components, desktop interface and a built-in editor.
links:
  - label: Open the editor
    to: /edit
    icon: i-lucide-square-play
  - label: Some usual topics
    to: /help
    color: neutral
    variant: subtle
    trailingIcon: i-lucide-arrow-right
---
::

::u-page-section
---
id: win
icon: i-lucide-info
headline: Win
title: What is Win?
description: Windows XP-inspired UI.
features:
  - title: Fast
    description: Runs well on modern browsers.
    icon: i-lucide-zap
    to: /win
  - title: Multilingual
    description: English and Finnish.
    icon: i-lucide-languages
  - title: Light and dark
    description: Modify colors and other preferences.
    icon: i-lucide-sun-moon
---
::

::::u-page-section
---
id: vue-components
icon: i-simple-icons-vuedotjs
headline: Vue
title: Vue components
description: Interactive components you use in your Vue pages.
---

:::u-page-grid
::u-page-card{title="Workflow builder" description="Drag, branch and loop steps to automate welcome sequences." icon="i-lucide-workflow" to="/demo?tab=workflow" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Personas" description="See how density, labels and notifications adapt as users grow." icon="i-lucide-users" to="/demo?tab=personas" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Voice and reputation" description="Tune tone, media and moderation, and see reputation scores at a glance." icon="i-lucide-megaphone" to="/demo?tab=profile" variant="outline" spotlight spotlight-color="primary"}
::

:::
::::

::::u-page-section
---
id: markdown-components
icon: i-lucide-file-text
headline: Markdown
title: Markdown components
description: Components you can write directly in markdown documents.
---

:::u-page-grid
::u-page-card{title="Charts" description="Data visualized with tooltips." icon="i-lucide-chart-column" to="/components/markdown#charts" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Timeline" description="Show events or steps in order, vertically or horizontally." icon="i-lucide-history" to="/components/markdown#timeline" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Progress group" description="A single track split into segments that add up to a maximum." icon="i-lucide-gauge" to="/components/markdown#progress-group" variant="outline" spotlight spotlight-color="primary"}
::
:::
::::

::u-page-section
---
id: editor
icon: i-lucide-pencil-line
headline: Editor
title: Write and insert components
description: A markdown editor with slash commands and component snippets.
features:
  - title: Slash commands
    description: Type / to insert blocks quickly.
    icon: i-lucide-slash
    to: /edit
  - title: Components
    description: Insert charts, timelines and progress groups.
    icon: i-lucide-blocks
    to: /components/markdown
  - title: Export
    description: Download your work as a markdown file.
    icon: i-lucide-download
---
::
