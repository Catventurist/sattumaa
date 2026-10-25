export type WarmTooltipSide = 'top' | 'bottom' | 'left' | 'right'
export type WarmTooltipSize = 'sm' | 'md' | 'lg'
export type WarmTooltipPhase = 'closed' | 'open' | 'closing'
export type WarmTooltipMode = 'cold' | 'warm' | 'instant'

export interface WarmTooltipPayload {
  id: string
  trigger: HTMLElement
  content: string
  shortcut?: string
  side: WarmTooltipSide
  gap: number
  arrow: boolean
  font: number
  px: number
  py: number
  popDuration: number
  popScale: number
  popBlur: number
  warmWindow: number
}

export interface WarmTooltipGroupApi {
  id: string
  delay: number
  warmWindow: number
  activeId: string | null
  isWarm: () => boolean
  show: (payload: WarmTooltipPayload, mode: WarmTooltipMode) => void
  hide: (tooltipId: string, instant?: boolean) => void
  reset: () => void
}

export const WARM_TOOLTIP_GROUP: InjectionKey<WarmTooltipGroupApi> = Symbol('warm-tooltip-group')
