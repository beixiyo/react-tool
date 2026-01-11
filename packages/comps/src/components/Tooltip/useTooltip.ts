import type { TooltipPlacement, TooltipTrigger } from './index'
import { useFloatingPosition, useResizeObserver } from 'hooks'
import { useEffect, useRef, useState } from 'react'

export type UseTooltipOptions = {
  placement?: TooltipPlacement
  visible?: boolean
  trigger?: TooltipTrigger
  disabled?: boolean
  offset?: number
  delay?: number
  autoHideOnResize?: boolean
}

export function useTooltip(options: UseTooltipOptions) {
  const {
    placement = 'top',
    visible,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    delay = 0,
    autoHideOnResize = false,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const resizeInitializedRef = useRef(false)

  /** 控制显示状态 */
  const shouldShow = visible !== undefined
    ? visible
    : isVisible

  const { style } = useFloatingPosition(triggerRef, tooltipRef, {
    enabled: shouldShow,
    placement,
    offset,
    boundaryPadding: 8,
    // Tooltip 目前仅做贴边，不做翻面，保持既有表现
    flip: false,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /** 显示 tooltip */
  const showTooltip = () => {
    if (disabled)
      return

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }
    else {
      setIsVisible(true)
    }
  }

  /** 隐藏 tooltip */
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  /** 使用 ResizeObserver 监听触发元素的变化，自动隐藏 Tooltip */
  useResizeObserver(
    [triggerRef],
    () => {
      /** 跳过初始化时的触发，避免首次显示时立即隐藏 */
      if (!resizeInitializedRef.current) {
        resizeInitializedRef.current = true
        return
      }

      if (autoHideOnResize && isVisible) {
        hideTooltip()
      }
    },
  )

  /** 处理触发事件 */
  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'focus') {
      showTooltip()
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip()
    }
  }

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip()
    }
  }

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip()
    }
  }

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip()
      }
      else {
        showTooltip()
      }
    }
  }

  /** 更新位置 */
  // 位置更新交给 useFloatingPosition

  /** 清理定时器 */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    shouldShow,
    style,
    triggerRef,
    tooltipRef,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleClick,
  }
}
