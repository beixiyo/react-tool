'use client'

import type { Variants } from 'motion/react'
import type { RefObject } from 'react'
import { onUnmounted, useClickOutside, useFloatingPosition } from 'hooks'
import { X } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'

/**
 * Popover 组件，用于在触发器元素旁边显示浮动内容
 */
export const Popover = memo(forwardRef<PopoverRef, PopoverProps>((
  {
    style,
    className,
    contentClassName,

    children,
    content,
    position = 'top',
    trigger = 'hover',
    disabled,
    removeDelay = 200,
    showDelay = 0,

    clickOutsideToClose = true,
    showCloseBtn = false,
    onOpen,
    onClose,
  },
  ref,
) => {
  /** Popover 是否打开 */
  const [isOpen, setIsOpen] = useState(false)

  /** 触发器元素的引用 */
  const triggerRef = useRef<HTMLDivElement>(null)
  /** 内容元素的引用 */
  const contentRef = useRef<HTMLDivElement>(null)
  /** 延迟关闭的计时器引用 */
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  /** 延迟显示的计时器引用 */
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    style: floatingStyle,
    placement: actualPosition,
  } = useFloatingPosition(triggerRef, contentRef, {
    enabled: isOpen,
    placement: position,
    offset: 8,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /**
   * 关闭 Popover 的处理函数
   */
  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  /**
   * Effects
   */
  useClickOutside(
    [triggerRef as RefObject<HTMLDivElement>, contentRef as RefObject<HTMLDivElement>],
    handleClose,
    {
      enabled: isOpen && (trigger === 'click' || trigger === 'command') && clickOutsideToClose,
    },
  )

  useEffect(() => {
    if (isOpen) {
      onOpen?.()
    }
  }, [isOpen, onOpen])

  onUnmounted(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }
  })

  /**
   * Events
   */

  /** 点击触发器时的处理函数 */
  const handleClick = () => {
    if (disabled)
      return
    if (trigger === 'click') {
      setIsOpen(!isOpen)
      if (!isOpen) {
        onOpen?.()
      }
      else {
        onClose?.()
      }
    }
    // trigger === 'command' 时不响应点击事件
  }

  /** 鼠标移入触发器时的处理函数 */
  const handleMouseEnter = () => {
    if (disabled)
      return

    if (trigger === 'hover') {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
        showTimeoutRef.current = null
      }

      if (showDelay <= 0) {
        setIsOpen(true)
        onOpen?.()
      }
      else {
        showTimeoutRef.current = setTimeout(() => {
          setIsOpen(true)
          onOpen?.()
        }, showDelay)
      }
    }
    // trigger === 'command' 时不响应鼠标事件
  }

  /** 延迟移除 Popover 的处理函数 */
  const removePopover = () => {
    if (removeDelay <= 0) {
      setIsOpen(false)
      onClose?.()
      return
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      onClose?.()
    }, removeDelay)
  }

  /** 鼠标移出触发器时的处理函数 */
  const handleMouseLeave = () => {
    if (disabled)
      return

    if (trigger === 'hover') {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
        showTimeoutRef.current = null
      }
      removePopover()
    }
    // trigger === 'command' 时不响应鼠标事件
  }

  /** 鼠标移入内容区域时的处理函数 */
  const handleContentMouseEnter = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
    // trigger === 'command' 时不响应鼠标事件
  }

  /** 鼠标移出内容区域时的处理函数 */
  const handleContentMouseLeave = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      removePopover()
    }
    // trigger === 'command' 时不响应鼠标事件
  }

  /***************************************************
   *                    Refs
   ***************************************************/
  useImperativeHandle(ref, () => ({
    open: () => {
      if (disabled || isOpen)
        return

      setIsOpen(true)
      onOpen?.()
    },
    close: () => {
      setIsOpen(false)
      onClose?.()
    },
  }), [disabled, isOpen, onOpen, onClose])

  /** 不同位置的动画变体 */
  const variants: VariantObj = {
    top: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    },
    bottom: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    left: {
      initial: { opacity: 0, x: 10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 10 },
    },
    right: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 },
    },
  }

  return (
    <>
      <div
        style={ style }
        ref={ triggerRef }
        onClick={ handleClick }
        onMouseEnter={ handleMouseEnter }
        onMouseLeave={ handleMouseLeave }
        className={ className }
      >
        { children }
      </div>

      <AnimateShow
        show={ isOpen }
        ref={ contentRef }
        className={ cn('fixed z-50 rounded-2xl shadow-lg p-4 bg-background', contentClassName) }
        style={ floatingStyle }
        variants={ variants[actualPosition as keyof VariantObj] }
        onMouseEnter={ handleContentMouseEnter }
        onMouseLeave={ handleContentMouseLeave }
      >
        { showCloseBtn && <X
          className={ `absolute top-1 right-2 cursor-pointer text-red-400 font-bold z-50
        hover:text-red-600 duration-300 hover:text-lg` }
          onClick={ () => {
            setIsOpen(false)
            onClose?.()
          } }
        /> }

        { content }
      </AnimateShow>
    </>
  )
}))

Popover.displayName = 'Popover'

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'
export type PopoverTrigger = 'hover' | 'click' | 'command'

type VariantObj = {
  [key in PopoverPosition]: Variants
}

export interface PopoverProps {
  /**
   * 触发器元素的类名
   */
  className?: string
  /**
   * 内容元素的类名
   */
  contentClassName?: string
  /**
   * 触发器元素的样式
   */
  style?: React.CSSProperties
  /**
   * 触发 Popover 的子元素
   */
  children: React.ReactNode
  /**
   * Popover 中显示的内容
   */
  content: React.ReactNode
  /**
   * Popover 的位置
   * @default 'top'
   */
  position?: PopoverPosition
  /**
   * 触发 Popover 的方式
   * - 'hover': 鼠标悬停触发
   * - 'click': 点击触发
   * - 'command': 命令式触发，只能通过 ref 的 open/close 方法控制
   * @default 'hover'
   */
  trigger?: PopoverTrigger
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showCloseBtn?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 移除 Popover 之前的延迟（毫秒）
   * @default 200
   */
  removeDelay?: number
  /**
   * 显示 Popover 之前的延迟（毫秒）
   * @default 0
   */
  showDelay?: number
  /**
   * 点击外部区域是否关闭 Popover
   * @default true
   */
  clickOutsideToClose?: boolean
  /**
   * Popover 打开时的回调
   */
  onOpen?: () => void
  /**
   * Popover 关闭时的回调
   */
  onClose?: () => void
}

/**
 * Popover 组件的 Ref
 */
export interface PopoverRef {
  /**
   * 手动打开 Popover
   */
  open: () => void
  /**
   * 手动关闭 Popover
   */
  close: () => void
}
