<script setup lang="ts">
import { animate, motionValue, useReducedMotion, useSpring, useVelocity } from 'motion-v'
import { WARM_TOOLTIP_GROUP, type WarmTooltipMode, type WarmTooltipPayload, type WarmTooltipPhase, type WarmTooltipSide } from '~/utils/tools'

const props = withDefaults(defineProps<{
  delay?: number
  warmWindow?: number
  travel?: number
  lean?: number
}>(), {
  delay: 400,
  warmWindow: 300,
  travel: 320,
  lean: 0
})

const emit = defineEmits<{ warmChange: [warm: boolean] }>()

type Timer = ReturnType<typeof setTimeout> | undefined
type Swap = { dir: number, across: boolean }

interface GroupState {
  state: WarmTooltipPhase
  current: WarmTooltipPayload | null
  mode: WarmTooltipMode | 'move'
  instant: boolean
  warmUntil: number
  warm: boolean
  swap: Swap
  closeTimer: Timer
  leaveTimer: Timer
  warmTimer: Timer
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const EASE_CSS = 'cubic-bezier(0.23, 1, 0.32, 1)'
const LEAN_SPRING = { stiffness: 260, damping: 22, mass: 0.4 }
const FULL_LEAN_SPEED = 1200
const SIGN: Record<WarmTooltipSide, number> = { top: 1, bottom: -1, left: -1, right: 1 }
const ORIGIN: Record<WarmTooltipSide, string> = {
  top: 'center bottom',
  bottom: 'center top',
  left: 'right center',
  right: 'left center'
}
const MARGIN = 8
const SWAP = 0.14
const SWAP_SHIFT = 10
const RISE = 4
const GRACE = 80

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
const horizontal = (side: WarmTooltipSide) => side === 'top' || side === 'bottom'

const anchorOf = (rect: DOMRect, side: WarmTooltipSide, gap: number): [number, number] => {
  if (side === 'top') return [rect.left + rect.width / 2, rect.top - gap]
  if (side === 'bottom') return [rect.left + rect.width / 2, rect.bottom + gap]
  if (side === 'left') return [rect.left - gap, rect.top + rect.height / 2]
  return [rect.right + gap, rect.top + rect.height / 2]
}
const layoutOf = (x: number, y: number, width: number, height: number, side: WarmTooltipSide) => {
  if (horizontal(side)) {
    const X = clamp(x - width / 2, MARGIN, Math.max(MARGIN, window.innerWidth - MARGIN - width))
    return { X, Y: side === 'top' ? y - height : y }
  }
  const Y = clamp(y - height / 2, MARGIN, Math.max(MARGIN, window.innerHeight - MARGIN - height))
  return { X: side === 'left' ? x - width : x, Y }
}

const reduce = useReducedMotion()
const id = useId()
const current = shallowRef<WarmTooltipPayload | null>(null)
const state = ref<WarmTooltipPhase>('closed')
const side = ref<WarmTooltipSide>('top')
const st: GroupState = {
  state: 'closed',
  current: null,
  mode: 'cold',
  instant: false,
  warmUntil: -Infinity,
  warm: false,
  swap: { dir: 0, across: false },
  closeTimer: undefined,
  leaveTimer: undefined,
  warmTimer: undefined
}
let textEl: HTMLElement | null = null
const outerRef = ref<HTMLSpanElement | null>(null)
const popRef = ref<HTMLSpanElement | null>(null)
const arrowRef = ref<HTMLSpanElement | null>(null)
const setText = (el: unknown) => {
  if (el) textEl = el as HTMLElement
}

const ax = motionValue(0)
const ay = motionValue(0)
const w = motionValue(0)
const ht = motionValue(0)
const presence = motionValue(0)
const vx = useVelocity(ax)
const vy = useVelocity(ay)
const leanUnit = useSpring(0, LEAN_SPRING)

const paintPlace = () => {
  const outer = outerRef.value
  if (!outer) return
  const sd = st.current ? st.current.side : 'top'
  const width = w.get()
  const height = ht.get()
  const x = ax.get()
  const y = ay.get()
  const { X, Y } = layoutOf(x, y, width, height, sd)
  outer.style.transform = `translate(${X}px, ${Y}px)`
  outer.style.width = `${width}px`
  outer.style.height = `${height}px`
  const arrow = arrowRef.value
  if (arrow) {
    if (horizontal(sd)) {
      arrow.style.left = `${clamp(x - X, 10, width - 10)}px`
      arrow.style.top = ''
    } else {
      arrow.style.top = `${clamp(y - Y, 10, height - 10)}px`
      arrow.style.left = ''
    }
  }
}
const paintPop = () => {
  const pop = popRef.value
  if (!pop) return
  const c = st.current
  const sd = c ? c.side : 'top'
  const p = presence.get()
  pop.style.opacity = String(p)
  if (reduce.value || !c) {
    pop.style.transform = 'none'
    pop.style.filter = 'none'
    return
  }
  const scale = c.popScale + (1 - c.popScale) * p
  const rise = (1 - p) * RISE * SIGN[sd] * (sd === 'left' ? -1 : 1)
  const rotate = leanUnit.get() * props.lean * SIGN[sd]
  const tx = horizontal(sd) ? 0 : rise
  const ty = horizontal(sd) ? rise : 0
  pop.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`
  pop.style.filter = `blur(${c.popBlur * (1 - p)}px)`
}
const updateLean = () => {
  const c = st.current
  const speed = c && !horizontal(c.side) ? vy.get() : vx.get()
  leanUnit.set(clamp(-speed / FULL_LEAN_SPEED, -1, 1))
}
const offs: (() => void)[] = []
onMounted(() => {
  offs.push(
    ax.on('change', paintPlace),
    ay.on('change', paintPlace),
    w.on('change', paintPlace),
    ht.on('change', paintPlace),
    presence.on('change', paintPop),
    leanUnit.on('change', paintPop),
    vx.on('change', updateLean),
    vy.on('change', updateLean)
  )
})

const isWarm = () => st.state !== 'closed' || now() < st.warmUntil
const notify = () => {
  const next = isWarm()
  if (next === st.warm) return
  st.warm = next
  emit('warmChange', next)
}
const finishClose = () => {
  st.state = 'closed'
  st.current = null
  state.value = 'closed'
  current.value = null
  notify()
}
const show = (payload: WarmTooltipPayload, mode: WarmTooltipMode) => {
  clearTimeout(st.closeTimer)
  clearTimeout(st.leaveTimer)
  const prev = st.current
  const fresh = st.state === 'closed'
  if (prev && prev.id !== payload.id) {
    const [px, py] = anchorOf(prev.trigger.getBoundingClientRect(), prev.side, prev.gap)
    const [nx, ny] = anchorOf(payload.trigger.getBoundingClientRect(), payload.side, payload.gap)
    const across = !horizontal(payload.side)
    st.swap = { dir: Math.sign(across ? ny - py : nx - px) || 1, across }
  } else {
    st.swap = { dir: 0, across: !horizontal(payload.side) }
  }
  st.mode = fresh ? mode : mode === 'instant' ? 'instant' : 'move'
  st.instant = mode === 'instant'
  st.current = payload
  st.state = 'open'
  side.value = payload.side
  current.value = payload
  state.value = 'open'
  notify()
}
const beginClose = (instant: boolean) => {
  const c = st.current
  if (!c || st.state !== 'open') return
  st.state = 'closing'
  state.value = 'closing'
  st.warmUntil = now() + c.warmWindow
  clearTimeout(st.warmTimer)
  st.warmTimer = setTimeout(notify, c.warmWindow + 1)
  if (instant) {
    presence.jump(0)
    finishClose()
    return
  }
  const closeMs = Math.round(c.popDuration * 0.8)
  animate(presence, 0, { duration: closeMs / 1000, ease: EASE_OUT })
  st.closeTimer = setTimeout(finishClose, closeMs)
}
const hide = (tooltipId: string, instant?: boolean) => {
  const c = st.current
  if (!c || c.id !== tooltipId || st.state !== 'open') return
  clearTimeout(st.leaveTimer)
  if (instant || st.instant) {
    beginClose(true)
    return
  }
  st.leaveTimer = setTimeout(() => beginClose(false), GRACE)
}
const reset = () => {
  if (st.current) hide(st.current.id, true)
  st.warmUntil = -Infinity
  clearTimeout(st.warmTimer)
  notify()
}

provide(WARM_TOOLTIP_GROUP, {
  id,
  get delay() {
    return props.delay
  },
  get warmWindow() {
    return props.warmWindow
  },
  get activeId() {
    return current.value ? current.value.id : null
  },
  isWarm,
  show,
  hide,
  reset
})
defineExpose({ reset })

watch(
  [current, state],
  () => {
    const c = st.current
    const text = textEl
    if (c && text && state.value === 'open') {
      const [tx, ty] = anchorOf(c.trigger.getBoundingClientRect(), c.side, c.gap)
      const tw = text.offsetWidth + c.px * 2
      const th = text.offsetHeight + c.py * 2
      if (st.mode === 'move' && !reduce.value && props.travel > 0) {
        const spring = { type: 'spring' as const, duration: props.travel / 1000, bounce: 0.1 }
        animate(ax, tx, spring)
        animate(ay, ty, spring)
        animate(w, tw, spring)
        animate(ht, th, spring)
        animate(presence, 1, { duration: 0.12, ease: EASE_OUT })
      } else {
        ax.jump(tx)
        ay.jump(ty)
        w.jump(tw)
        ht.jump(th)
        if (st.mode === 'cold') {
          presence.jump(0)
          animate(presence, 1, { duration: c.popDuration / 1000, ease: EASE_OUT })
        } else {
          presence.jump(1)
        }
      }
    }
    paintPlace()
    paintPop()
  },
  { flush: 'post' }
)

watch(state, (s, _o, onCleanup) => {
  if (s === 'closed') return
  let raf = 0
  const follow = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const c = st.current
      if (!c) return
      const [tx, ty] = anchorOf(c.trigger.getBoundingClientRect(), c.side, c.gap)
      ax.jump(tx)
      ay.jump(ty)
    })
  }
  const onHidden = () => {
    if (document.visibilityState === 'hidden' && st.current) hide(st.current.id, true)
  }
  window.addEventListener('scroll', follow, { capture: true, passive: true })
  window.addEventListener('resize', follow)
  document.addEventListener('visibilitychange', onHidden)
  onCleanup(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', follow, { capture: true })
    window.removeEventListener('resize', follow)
    document.removeEventListener('visibilitychange', onHidden)
  })
})

onBeforeUnmount(() => {
  clearTimeout(st.closeTimer)
  clearTimeout(st.leaveTimer)
  clearTimeout(st.warmTimer)
  offs.forEach(off => off());
  [ax, ay, w, ht, presence, leanUnit].forEach(v => v.stop())
})

const layer = (dir: number, across: boolean, shown: boolean) => {
  const shift = shown ? 0 : SWAP_SHIFT * dir
  return {
    opacity: shown ? 1 : 0,
    transform: `translate(${across ? 0 : shift}px, ${across ? shift : 0}px)`,
    filter: shown ? 'blur(0px)' : 'blur(3px)'
  }
}
const onEnter = (el: Element, done: () => void) => {
  const { dir, across } = st.swap
  if (reduce.value || dir === 0) {
    done()
    return
  }
  const a = el.animate([layer(dir, across, false), layer(dir, across, true)], {
    duration: SWAP * 1000,
    easing: EASE_CSS
  })
  a.onfinish = () => {
    a.cancel()
    done()
  }
}
const onLeave = (el: Element, done: () => void) => {
  const { dir, across } = st.swap
  if (reduce.value) {
    done()
    return
  }
  el.animate([layer(dir, across, true), layer(-dir, across, false)], {
    duration: SWAP * 1000,
    easing: EASE_CSS,
    fill: 'forwards'
  }).onfinish = done
}
</script>

<template>
  <div class="contents">
    <slot />

    <ClientOnly>
      <Teleport to="body">
        <span
          v-if="state !== 'closed' && current"
          :id="id"
          ref="outerRef"
          role="tooltip"
          class="pointer-events-none fixed top-0 left-0 z-9999 block"
          :data-side="side"
        >
          <span
            ref="popRef"
            class="absolute inset-0 rounded-md bg-default text-highlighted ring ring-default shadow-md"
            :style="{ transformOrigin: ORIGIN[side] }"
          >
            <Transition
              :css="false"
              @enter="onEnter"
              @leave="onLeave"
            >
              <span
                :key="current.id"
                class="absolute inset-0 flex items-center justify-center"
              >
                <span
                  :ref="setText"
                  class="inline-flex items-center gap-2 whitespace-nowrap font-medium leading-tight tracking-tight"
                  :style="{ fontSize: `${current.font}px` }"
                >
                  {{ current.content }}
                  <UKbd
                    v-if="current.shortcut"
                    :value="current.shortcut"
                    size="sm"
                  />
                </span>
              </span>
            </Transition>

            <span
              v-if="current.arrow"
              ref="arrowRef"
              class="absolute -m-1 size-2 rotate-45 rounded-[2px] bg-default data-[side=top]:bottom-px data-[side=bottom]:top-px data-[side=left]:right-px data-[side=right]:left-px"
              :data-side="side"
              aria-hidden="true"
            />
          </span>
        </span>
      </Teleport>
    </ClientOnly>
  </div>
</template>
