<script setup lang="ts">
export interface BranchMenuChild {
  value: string
  label: string
  icon?: string
}

export interface BranchMenuItem {
  label: string
  value?: string
  children?: BranchMenuChild[]
}

interface BranchMenuProps {
  items?: BranchMenuItem[]
  defaultOpen?: number | number[]
  defaultActive?: string
  width?: number
  rowHeight?: number
  indent?: number
  trunk?: number
  radius?: number
  lineWidth?: number
  fontSize?: number
  drawDuration?: number
  foldDuration?: number
}

const PAD = 6
const MARK = 16

function toSet(value: number | number[]) {
  return new Set(Array.isArray(value) ? value : value >= 0 ? [value] : [])
}

const props = withDefaults(defineProps<BranchMenuProps>(), {
  items: undefined,
  defaultOpen: 0,
  defaultActive: '',
  width: 240,
  rowHeight: 36,
  indent: 40,
  trunk: 14,
  radius: 10,
  lineWidth: 1.5,
  fontSize: 14,
  drawDuration: 400,
  foldDuration: 300
})

const emit = defineEmits<{
  select: [value: string, item: BranchMenuChild | BranchMenuItem]
  toggle: [index: number, open: boolean]
}>()

const { t } = useI18n()

const defaultItems = computed<BranchMenuItem[]>(() => [
  {
    label: t('branchMenu.gettingStarted'),
    children: [
      { value: 'install', label: t('branchMenu.installation'), icon: 'i-lucide-download' },
      { value: 'quick', label: t('branchMenu.quickStart'), icon: 'i-lucide-rocket' },
      { value: 'config', label: t('branchMenu.configuration'), icon: 'i-lucide-settings' },
      { value: 'theming', label: t('branchMenu.theming'), icon: 'i-lucide-paintbrush' }
    ]
  },
  {
    label: t('branchMenu.components'),
    children: [
      { value: 'buttons', label: t('branchMenu.buttons'), icon: 'i-lucide-mouse-pointer-click' },
      { value: 'typography', label: t('branchMenu.typography'), icon: 'i-lucide-type' },
      { value: 'overlays', label: t('branchMenu.overlays'), icon: 'i-lucide-layers' },
      { value: 'toasts', label: t('branchMenu.toasts'), icon: 'i-lucide-bell' }
    ]
  }
])

const menuItems = computed(() => props.items ?? defaultItems.value)
const open = ref<Set<number>>(toSet(props.defaultOpen))
const active = ref(
  props.defaultActive
  || (menuItems.value.find((it, i) => it.children && toSet(props.defaultOpen).has(i))?.children?.[0]?.value ?? '')
)

const navRef = useTemplateRef<HTMLElement>('navRef')
const markerRef = useTemplateRef<HTMLSpanElement>('markerRef')
const heads: (HTMLButtonElement | null)[] = []
let resizeObserver: ResizeObserver | null = null

const activeSection = computed(() =>
  menuItems.value.findIndex(it => it.children?.some(kid => kid.value === active.value))
)
const markerShown = computed(() => activeSection.value >= 0 && open.value.has(activeSection.value))

function place(glide: boolean) {
  const m = markerRef.value
  const el = heads[activeSection.value]
  if (!m) return
  const on = markerShown.value && el
  if (!glide) m.style.transition = 'none'
  if (on) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`
  m.toggleAttribute('data-on', Boolean(on))
  if (!glide) {
    void m.offsetHeight
    m.style.transition = ''
  }
}

function bindMarker() {
  resizeObserver?.disconnect()
  place(true)
  let first = true
  resizeObserver = new ResizeObserver(() => {
    if (first) {
      first = false
      return
    }
    place(false)
  })
  if (navRef.value) resizeObserver.observe(navRef.value)
}

onMounted(bindMarker)
onUnmounted(() => resizeObserver?.disconnect())
watch(
  () => [activeSection.value, markerShown.value, menuItems.value, props.fontSize, props.rowHeight],
  bindMarker,
  { flush: 'post' }
)

function select(value: string, item: BranchMenuChild | BranchMenuItem) {
  active.value = value
  emit('select', value, item)
}

function toggle(i: number) {
  const next = new Set(open.value)
  const isOpen = !next.has(i)
  if (isOpen) next.add(i)
  else next.delete(i)
  open.value = next
  emit('toggle', i, isOpen)
}

const corner = computed(() => Math.min(props.radius, props.rowHeight / 2 - 2))
const endX = computed(() => props.indent - 8)

function rowY(k: number) {
  return PAD + k * props.rowHeight + props.rowHeight / 2
}

function branch(k: number) {
  return `M ${props.trunk} ${rowY(k) - corner.value} A ${corner.value} ${corner.value} 0 0 0 ${props.trunk + corner.value} ${rowY(k)} H ${endX.value}`
}

function reach(k: number) {
  return `M ${props.trunk} 0 V ${rowY(k) - corner.value} A ${corner.value} ${corner.value} 0 0 0 ${props.trunk + corner.value} ${rowY(k)} H ${endX.value}`
}

function dashLength(k: number) {
  return rowY(k) - corner.value + (Math.PI * corner.value) / 2 + (endX.value - props.trunk - corner.value)
}

function trunkPath(count: number) {
  return `M ${props.trunk} 0 V ${rowY(count - 1) - corner.value}`
}

function sectionHeight(count: number) {
  return PAD * 2 + count * props.rowHeight
}

const navStyle = computed(() => ({
  '--ui-w': `${props.width}px`,
  '--ui-font': `${props.fontSize}px`,
  '--ui-row': `${props.rowHeight}px`,
  '--ui-indent': `${props.indent}px`,
  '--ui-draw': `${props.drawDuration}ms`,
  '--ui-fold': `${props.foldDuration}ms`
}))
</script>

<template>
  <nav
    ref="navRef"
    class="relative flex flex-col w-fit max-w-[min(var(--ui-w),100%)] pl-3.5 text-(length:--ui-font) leading-[1.2] before:absolute before:top-2 before:bottom-0 before:left-0 before:w-0.5 before:rounded-[1px] before:content-[''] before:bg-linear-to-b before:from-primary/25 before:from-55% before:to-transparent"
    :style="navStyle"
  >
    <span
      ref="markerRef"
      class="absolute -top-px left-0 z-1 h-4 w-0.5 rounded-[1px] bg-primary opacity-0 data-on:opacity-100 transition-[top,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity"
      aria-hidden="true"
    />
    <div
      v-for="(item, i) in menuItems"
      :key="item.value ?? item.label"
      class="group/section flex flex-col"
      :data-open="item.children && open.has(i) ? '' : undefined"
    >
      <button
        :ref="(el: unknown) => (heads[i] = el as HTMLButtonElement | null)"
        type="button"
        class="block m-0 border-0 bg-transparent py-2.25 text-left font-medium text-muted text-[calc(var(--ui-font)+1px)] outline-none cursor-pointer transition-colors duration-200 hover:text-default group-data-open/section:text-default data-active:text-default [-webkit-tap-highlight-color:transparent]"
        :aria-expanded="item.children ? open.has(i) : undefined"
        :aria-current="!item.children && (item.value ?? item.label) === active ? 'true' : undefined"
        :data-active="!item.children && (item.value ?? item.label) === active ? '' : undefined"
        @click="item.children ? toggle(i) : select(item.value ?? item.label, item)"
      >
        {{ item.label }}
      </button>
      <div
        v-if="item.children"
        class="grid grid-rows-[0fr] group-data-open/section:grid-rows-[1fr] transition-[grid-template-rows] duration-(--ui-fold) ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
      >
        <div class="min-h-0 overflow-hidden">
          <div
            class="relative box-border py-1.5"
            :style="{ height: `${sectionHeight(item.children.length)}px` }"
          >
            <svg
              class="absolute top-0 left-0 overflow-visible opacity-0 pointer-events-none transition-opacity duration-200 group-data-open/section:opacity-100 group-data-open/section:duration-250 group-data-open/section:delay-100"
              :width="indent"
              :height="sectionHeight(item.children.length)"
              aria-hidden="true"
            >
              <path
                class="fill-none stroke-primary/25"
                stroke-linecap="round"
                stroke-linejoin="round"
                :stroke-width="lineWidth"
                :d="trunkPath(item.children.length)"
              />
              <path
                v-for="(kid, k) in item.children"
                :key="`line-${kid.value}`"
                class="fill-none stroke-primary/25"
                stroke-linecap="round"
                stroke-linejoin="round"
                :stroke-width="lineWidth"
                :d="branch(k)"
              />
              <path
                v-for="(kid, k) in item.children"
                :key="`reach-${kid.value}`"
                class="fill-none stroke-primary transition-[stroke-dashoffset] duration-(--ui-draw) ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                stroke-linecap="round"
                stroke-linejoin="round"
                :stroke-width="lineWidth"
                :d="reach(k)"
                :style="{
                  strokeDasharray: dashLength(k),
                  strokeDashoffset: kid.value === active ? 0 : dashLength(k)
                }"
              />
            </svg>
            <button
              v-for="kid in item.children"
              :key="kid.value"
              type="button"
              class="box-border flex items-center gap-2 m-0 h-(--ui-row) w-full border-0 bg-transparent py-0 pr-0 pl-(--ui-indent) text-left text-muted outline-none cursor-pointer transition-colors duration-200 hover:text-default data-active:font-medium data-active:text-primary [-webkit-tap-highlight-color:transparent]"
              :aria-current="kid.value === active ? 'true' : undefined"
              :data-active="kid.value === active ? '' : undefined"
              :tabindex="open.has(i) ? 0 : -1"
              @click="select(kid.value, kid)"
            >
              <UIcon
                v-if="kid.icon"
                :name="kid.icon"
                class="size-4 flex-none"
                aria-hidden="true"
              />
              <span class="whitespace-nowrap">{{ kid.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
