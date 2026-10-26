---
title: Markdown components
description: Many helpful tools to show infromation how you like.
navigation: 
  icon: i-lucide-astroid
layout: docs
---

## Usage 

Use them while writing the text in markdown documents. Make the important information show up the way you want.

Examples are using YML method primarily, a collection of most recent UI components.

## Charts

Plot data as lines, areas, bars or a donut. Rendered as SVG on the server, and it follows its container width.

::tabs
  :::tabs-item{label="Inline attributes" icon="i-lucide-code"}
  ```md
  ::u-chart{type="bar" index="month" aria-label="Visitors per month" :colors='["success","info"]' :categories='["desktop","mobile"]' :data='[{"month":"January","desktop":186,"mobile":80},{"month":"February","desktop":305,"mobile":200}]'}
  ::
  ```
  :::

  :::tabs-item{label="YAML props" icon="i-lucide-file-text"}
  ```md
  ::u-chart
  ---
  type: bar
  index: month
  ariaLabel: Visitors per month
  colors:
    - success
    - info
  categories:
    - key: desktop
      label: Desktop
    - key: mobile
      label: Mobile
  data:
    - month: January
      desktop: 18
      mobile: 8
    - month: February
      desktop: 30
      mobile: 20
  ---
  ::
  ```
  :::
::

### Props

- `type`: `line`, `area`, `bar` or `donut`. Defaults to `line`.
- `data`: one object per x value, or per slice with `donut`.
- `index`: the key used for the x axis, or the slice labels with `donut`.
- `categories`: the series, as keys or objects with `key`, `label` and `color`.
- `colors`: series colors, as theme colors or any CSS color.
- `stacked`: stacks series, for `area` and `bar` only.
- `curve`: `linear`, `monotone` or `step`, for `line` and `area` only.
- `points`: draws a dot at each value, for `line` only.
- `grid`, `xAxis`, `yAxis`: toggle the grid and axes. All default to `true`.
- `xLabel`, `yLabel`: axis titles.
- `legend`: shown by default when there is more than one series.
- `tooltip`: `true` by default, or `false` to hide.
- `thickness`: ring width in pixels, for `donut` only. Defaults to `24`.
- `height`, `width`, `aspectRatio`: sizing. Height defaults to `300`.
- `ariaLabel`, `ariaDescription`: accessible name and description.

## Timeline

Show events or steps in order, vertically or horizontally.

::u-timeline
---
color: primary
size: md
orientation: vertical
items:
  - date: Mar 15, 2026
    title: Project kickoff
    description: The team aligned on scope and goals.
    icon: i-lucide-rocket
  - date: Apr 2, 2026
    title: First prototype
    description: An early version was shared for feedback.
    icon: i-lucide-flask-conical
  - date: May 20, 2026
    title: Launch
    description: The project went live.
    icon: i-lucide-party-popper
---
::

::tabs
  :::tabs-item{label="Inline attributes" icon="i-lucide-code"}
  ```md
  ::u-timeline{orientation="vertical" :items='[{"date":"Mar 15, 2026","title":"Project kickoff","description":"The team aligned on scope and goals.","icon":"i-lucide-rocket"},{"date":"Apr 2, 2026","title":"First prototype","description":"An early version was shared for feedback.","icon":"i-lucide-flask-conical"}]'}
  ::
  ```
  :::

  :::tabs-item{label="YAML props" icon="i-lucide-file-text"}
  ```md
  ::u-timeline
  ---
  orientation: vertical
  items:
    - date: Mar 15, 2026
      title: Project kickoff
      description: The team aligned on scope and goals.
      icon: i-lucide-rocket
    - date: Apr 2, 2026
      title: First prototype
      description: An early version was shared for feedback.
      icon: i-lucide-flask-conical
  ---
  ::
  ```
  :::
::

### Props

- `items`: the events to display.
- `orientation`: `vertical` or `horizontal`. Defaults to `vertical`.
- `color`: a theme color. Defaults to `primary`.
- `size`: `3xs` to `3xl`. Defaults to `md`.
- `reverse`: reverses the order of the items.
- `defaultValue`, `modelValue`: the active item, matched against each item's `value` (set by `valueKey`).
- `valueKey`: the item key used as the value. Defaults to `value`.
- `as`: the element to render as. Defaults to `div`.

### Slots

- `indicator`, `wrapper`, `date`, `title`, `description`: customize each part, receiving `item`.


## Progress group

A single track split into segments that add up to `max`. Each item is one segment, with an optional legend list.

::u-progress-group
---
max: 100
status: true
color: primary
size: md
items:
  - label: Design
    value: 40
    color: info
  - label: Development
    value: 35
    color: success
  - label: Review
    value: 15
    color: warning
---
::

::tabs
  :::tabs-item{label="Inline attributes" icon="i-lucide-code"}
  ```md
  ::u-progress-group{:max="100" status size="md" :items='[{"label":"Design","value":40,"color":"info"},{"label":"Development","value":35,"color":"success"},{"label":"Review","value":15,"color":"warning"}]'}
  ::
  ```
  :::

  :::tabs-item{label="YAML props" icon="i-lucide-file-text"}
  ```md
  ::u-progress-group
  ---
  max: 100
  status: true
  size: md
  items:
    - label: Design
      value: 40
      color: info
    - label: Development
      value: 35
      color: success
    - label: Review
      value: 15
      color: warning
  ---
  ::
  ```
  :::
::

### Props

- `items`: the segments to draw. Each one takes up a share of the track.
- `max`: the value all items add up to. Defaults to `100`.
- `status`: shows the summed progress value.
- `size`: `2xs` to `2xl`. Defaults to `md`.
- `color`: a theme color or any CSS color. Defaults to `primary`.
- `orientation`: `horizontal` or `vertical`. Defaults to `horizontal`.
- `as`: the element to render as. Defaults to `div`.

### Slots

- `status`: custom status content, receives `percent`.
- `item`, `item-leading`, `item-label`, `item-trailing`: customize each legend row, receiving `item`, `index` and `percent`.


## Data scenarios

::kind
::