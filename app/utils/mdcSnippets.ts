export const mdcSnippets = {
  chart: `::u-chart
---
type: bar
index: month
categories:
  - key: desktop
    label: Desktop
data:
  - month: January
    desktop: 186
  - month: February
    desktop: 305
---
::`,
  timeline: `::u-timeline
---
orientation: vertical
items:
  - date: Mar 15, 2026
    title: Project kickoff
    icon: i-lucide-rocket
---
::`,
  progressGroup: `::u-progress-group
---
max: 100
items:
  - label: Design
    value: 40
    color: info
  - label: Development
    value: 35
    color: success
---
::`
} as const
