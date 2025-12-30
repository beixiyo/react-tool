import type { TooltipPlacement, TooltipTrigger } from './index'
import { useResizeObserver } from 'hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const resizeInitializedRef = useRef(false)

  /** 控制显示状态 */
  const shouldShow = visible !== undefined
    ? visible
    : isVisible

  /** 计算 tooltip 位置 */
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current)
      return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    let x = 0
    let y = 0

    /** 根据 placement 计算基础位置 */
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.top - tooltipRect.height - offset
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.bottom + offset
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
      case 'right':
        x = triggerRect.right + offset
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
    }

    /** 边界检测和调整 */
    if (x < 0)
      x = 8
    if (x + tooltipRect.width > viewport.width)
      x = viewport.width - tooltipRect.width - 8
    if (y < 0)
      y = 8
    if (y + tooltipRect.height > viewport.height)
      y = viewport.height - tooltipRect.height - 8

    setPosition({ x, y })
  }, [placement, offset])

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
  useEffect(() => {
    if (shouldShow) {
      calculatePosition()

      const handleResize = () => calculatePosition()
      const handleScroll = () => calculatePosition()

      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [shouldShow, calculatePosition])

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
    position,
    triggerRef,
    tooltipRef,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleClick,
  }
}
