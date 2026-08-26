'use client'

import { useClickOutside, useFloatingPosition, useKeyboardLayer, useLatestCallback } from 'hooks'
import type { Variants } from 'motion/react'
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn, focusElement } from 'utils'
import { Z } from '../../constants/z-index'
import { AnimateShow } from '../Animate'

/** 菜单动画变体（不依赖 props/state，提到模块顶层避免每次渲染重建） */
const MENU_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
}

const InnerContextMenu = forwardRef<ContextMenuRef, ContextMenuProps>(({
  style,
  className,
  children,
  width = 200,
  onOpen,
  onClose,
  closeOnClick = true,
  open,
  onOpenChange,
  clickOutsideIgnoreSelector,
  closeOnClickIgnoreSelector,
}, ref) => {
  /** 判断是否为受控模式 */
  const isControlled = open !== undefined

  /** 菜单是否打开（非受控模式使用内部状态） */
  const [internalOpen, setInternalOpen] = useState(false)

  /** 实际使用的打开状态 */
  const isOpen = isControlled
    ? open
    : internalOpen
  /** 菜单内容引用 */
  const menuRef = useRef<HTMLDivElement>(null)
  /** 打开前的焦点，用于关闭后恢复 */
  const previousFocusedRef = useRef<HTMLElement | null>(null)
  /** 标记是否曾经打开，避免首次关闭态触发焦点恢复 */
  const wasOpenRef = useRef(false)
  /** 鼠标点击位置的虚拟 reference */
  const [virtualReference, setVirtualReference] = useState<DOMRect | null>(null)

  /** 使用 useFloatingPosition 计算浮层位置 */
  const { style: floatingStyle } = useFloatingPosition(
    { current: null } as RefObject<HTMLElement | null>,
    menuRef,
    {
      enabled: isOpen && !!virtualReference,
      placement: 'bottom-start',
      offset: 4,
      boundaryPadding: 8,
      flip: true,
      shift: true,
      autoUpdate: true,
      scrollCapture: true,
      virtualReferenceRect: virtualReference,
    },
  )

  /**
   * 打开菜单
   */
  const handleOpen = useLatestCallback((event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isOpen) {
      previousFocusedRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    }

    if (isControlled) {
      /** 受控模式：通知外部状态变化 */
      onOpenChange?.(true)
      onOpen?.()
    }
    else {
      /** 非受控模式：更新内部状态 */
      setInternalOpen(true)
      onOpen?.()
    }

    /** 设置虚拟 reference 为鼠标点击位置 */
    setVirtualReference({
      top: event.clientY,
      left: event.clientX,
      right: event.clientX,
      bottom: event.clientY,
      width: 0,
      height: 0,
      x: event.clientX,
      y: event.clientY,
      toJSON: () => '',
    })
  })

  /**
   * 关闭菜单
   */
  const handleClose = useLatestCallback(() => {
    if (isControlled) {
      /** 受控模式：通知外部状态变化 */
      onOpenChange?.(false)
      onClose?.()
    }
    else {
      /** 非受控模式：更新内部状态 */
      setInternalOpen(false)
      onClose?.()
    }
    /** 清除虚拟 reference */
    setVirtualReference(null)
  })

  /**
   * 处理菜单内容点击，如果启用 closeOnClick 则关闭菜单
   */
  const handleMenuClick = useLatestCallback((event: ReactMouseEvent) => {
    if (closeOnClick) {
      /** 检查是否点击在忽略选择器区域内 */
      if (closeOnClickIgnoreSelector) {
        const target = event.target as HTMLElement
        const ignoredElement = target.closest(closeOnClickIgnoreSelector)
        if (ignoredElement) {
          /** 点击在有二级菜单的区域，不关闭菜单 */
          return
        }
      }

      /** 阻止事件冒泡，避免触发 useClickOutside */
      event.stopPropagation()
      handleClose()
    }
  })

  useKeyboardLayer({
    active: isOpen,
    keys: ['Escape'],
    priority: typeof style?.zIndex === 'number'
      ? style.zIndex
      : Z.dropdown,
    allowRepeat: false,
    onKeyDown: handleClose,
  })

  useEffect(() => {
    if (!isOpen) return

    wasOpenRef.current = true
    if (!previousFocusedRef.current) {
      previousFocusedRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    }

    const raf = requestAnimationFrame(() => {
      const menu = menuRef.current
      if (!menu) return

      focusElement(menu)
    })

    return () => {
      cancelAnimationFrame(raf)

      if (!wasOpenRef.current) return

      wasOpenRef.current = false
      const previous = previousFocusedRef.current
      previousFocusedRef.current = null
      if (!previous || !document.contains(previous)) return

      focusElement(previous)
    }
  }, [isOpen, menuRef, previousFocusedRef])

  /**
   * 监听全局右键事件（仅在非受控模式下）
   */
  useEffect(() => {
    /** 受控模式下不监听全局事件 */
    if (isControlled) return

    const handleContextMenu = (event: MouseEvent) => {
      handleOpen(event)
    }

    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [handleOpen, isControlled])

  /**
   * 点击外部关闭菜单
   */
  useClickOutside(
    [menuRef as RefObject<HTMLDivElement>],
    handleClose,
    {
      enabled: isOpen,
      additionalSelectors: clickOutsideIgnoreSelector
        ? [clickOutsideIgnoreSelector]
        : [],
    },
  )

  /**
   * 暴露给外部的方法
   */
  useImperativeHandle(ref, () => ({
    open: (event: MouseEvent) => {
      handleOpen(event)
    },
    close: handleClose,
  }), [handleClose, handleOpen])

  return (
    <AnimateShow
      show={ isOpen }
      ref={ menuRef }
      className={ cn(
        'fixed z-dropdown rounded-2xl bg-background shadow-lg',
        className,
      ) }
      role="menu"
      tabIndex={ -1 }
      style={ {
        ...floatingStyle,
        width: `${width}px`,
        ...style,
      } }
      variants={ MENU_VARIANTS }
      exitSetMode
      onClick={ handleMenuClick }
    >
      { children }
    </AnimateShow>
  )
})

InnerContextMenu.displayName = 'ContextMenu'

export const ContextMenu = memo(InnerContextMenu) as typeof InnerContextMenu

export type ContextMenuProps = {
  /**
   * 菜单内容
   */
  children?: React.ReactNode
  /**
   * 菜单宽度（像素）
   * @default 200
   */
  width?: number
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
  /**
   * 菜单打开时的回调
   */
  onOpen?: () => void
  /**
   * 菜单关闭时的回调
   */
  onClose?: () => void
  /**
   * 点击菜单内容时是否自动关闭
   * @default true
   */
  closeOnClick?: boolean
  /**
   * 受控模式：菜单是否打开
   * 当提供此 prop 时，组件进入受控模式，不会监听全局 contextmenu 事件，
   * 需自行监听右键并通过 ref.open(event) 触发打开（仅传 open 不会自动右键弹出）
   */
  open?: boolean
  /**
   * 受控模式：菜单打开状态变化时的回调
   */
  onOpenChange?: (open: boolean) => void
  /**
   * 点击外部关闭时忽略的选择器
   * 用于防止点击某些元素（如 Popover 内容）时关闭菜单
   */
  clickOutsideIgnoreSelector?: string
  /**
   * 点击菜单内容关闭时忽略的选择器
   * 用于防止点击有二级菜单的项（如 Popover trigger）时关闭菜单
   */
  closeOnClickIgnoreSelector?: string
}

/**
 * ContextMenu 组件的 Ref
 */
export interface ContextMenuRef {
  /**
   * 手动打开菜单
   */
  open: (event: MouseEvent) => void
  /**
   * 手动关闭菜单
   */
  close: () => void
}
