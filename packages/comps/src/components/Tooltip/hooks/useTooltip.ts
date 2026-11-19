/**
 * Tooltip 的策略层：组合触发器交互与浮层定位，并叠加「触发器尺寸变化时自动隐藏」
 */
import { useControllableState, useKeyboardLayer, useLatestCallback, useResizeObserver } from 'hooks'
import type { FocusEvent as ReactFocusEvent } from 'react'
import { useMemo, useRef } from 'react'
import { Z } from '../../../constants/z-index'
import { useFloatingTrigger } from '../../../hooks/useFloatingTrigger'
import type { FloatingArrowConfig } from '../../FloatingArrow'
import { useFloatingLayer } from '../../FloatingArrow'
import type { TooltipPlacement, TooltipTrigger } from '../types'

export function useTooltip(options: UseTooltipOptions) {
  const {
    placement = 'top',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    arrow,
    delay = 0,
    autoHideOnResize = false,
    escToClose = true,
    zIndex,
  } = options

  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const resizeInitializedRef = useRef(false)

  const [openState, setOpenState, isControlled] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const {
    isOpen,
    open,
    close,
    triggerProps: baseTriggerProps,
  } = useFloatingTrigger({
    trigger,
    disabled,
    open: openState,
    onOpenChange: setOpenState,
    showDelay: delay,
  })

  /**
   * hover 模式补上键盘路径：键盘聚焦（`:focus-visible`）触发器时显示，失焦时隐藏；
   * 鼠标点击产生的聚焦不触发，避免点按钮时多弹一次提示
   */
  const handleFocus = useLatestCallback((event: ReactFocusEvent<HTMLElement>) => {
    baseTriggerProps.onFocus()
    if (trigger !== 'hover' || disabled || !isFocusVisible(event.target)) return
    open()
  })

  const handleBlur = useLatestCallback(() => {
    baseTriggerProps.onBlur()
    if (trigger !== 'hover') return
    close()
  })

  const triggerProps = useMemo(() => ({
    ...baseTriggerProps,
    onFocus: handleFocus,
    onBlur: handleBlur,
  }), [baseTriggerProps, handleFocus, handleBlur])

  const {
    style,
    arrowProps,
  } = useFloatingLayer(triggerRef, tooltipRef, {
    enabled: isOpen,
    placement,
    offset,
    arrow,
    boundaryPadding: 8,
    /** 启用智能翻面：当首选位置（如 top）空间不足时，自动使用相反方向（如 bottom），反之亦然 */
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /**
   * Esc 关掉浮层：与 Modal / Popover 共用键盘层栈，优先级取浮层真实的 `z-tooltip`
   *
   * 受控且没有 `onOpenChange` 回传口时不注册：这里 `close()` 关不掉它，
   * 一个常显的受控 Tooltip 若占着栈顶，底下弹窗的 Esc 会被永远吃掉
   */
  useKeyboardLayer({
    active: isOpen && escToClose && (!isControlled || !!onOpenChange),
    keys: ['Escape'],
    priority: zIndex ?? Z.tooltip,
    allowRepeat: false,
    onKeyDown: close,
  })

  /** 使用 ResizeObserver 监听触发元素的变化，自动隐藏 Tooltip */
  useResizeObserver(
    [triggerRef],
    () => {
      /** 跳过初始化时的触发，避免首次显示时立即隐藏 */
      if (!resizeInitializedRef.current) {
        resizeInitializedRef.current = true
        return
      }

      if (autoHideOnResize && isOpen) close()
    },
  )

  return {
    shouldShow: isOpen,
    style,
    arrowProps,
    triggerRef,
    tooltipRef,
    triggerProps,
  }
}

/** 只有键盘聚焦才显示 */
function isFocusVisible(element: Element) {
  try {
    return element.matches(':focus-visible')
  }
  catch {
    return true
  }
}

export type UseTooltipOptions = {
  placement?: TooltipPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: TooltipTrigger
  disabled?: boolean
  offset?: number
  arrow?: FloatingArrowConfig
  delay?: number
  autoHideOnResize?: boolean
  escToClose?: boolean
  zIndex?: number
}
