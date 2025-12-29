'use client'

import type { Variants } from 'framer-motion'
import type { RefObject } from 'react'
import { onUnmounted, useClickOutside } from 'hooks'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'

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
}, ref) => {
  /** 判断是否为受控模式 */
  const isControlled = open !== undefined

  /** 菜单是否打开（非受控模式使用内部状态） */
  const [internalOpen, setInternalOpen] = useState(false)

  /** 实际使用的打开状态 */
  const isOpen = isControlled
    ? open
    : internalOpen
  /** 菜单位置坐标 */
  const [coords, setCoords] = useState({ x: -9999, y: -9999 })
  /** 菜单内容引用 */
  const menuRef = useRef<HTMLDivElement>(null)

  /**
   * 计算菜单位置，确保始终可见
   */
  const calculatePosition = useCallback((clientX: number, clientY: number, estimatedHeight?: number) => {
    if (!menuRef.current)
      return

    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 8 // 距离屏幕边缘的最小距离

    /** 使用实际高度，如果还没有渲染完成则使用估算高度 */
    const menuHeight = menuRect.height > 0
      ? menuRect.height
      : estimatedHeight || 100

    let x = clientX
    let y = clientY

    /** 水平方向：如果右侧超出，则显示在左侧 */
    if (x + width > viewportWidth - margin) {
      x = clientX - width
    }
    /** 如果左侧超出，则贴边显示 */
    if (x < margin) {
      x = margin
    }

    /** 垂直方向：如果下方超出，则显示在上方 */
    if (y + menuHeight > viewportHeight - margin) {
      y = clientY - menuHeight
    }
    /** 如果上方超出，则贴边显示 */
    if (y < margin) {
      y = margin
    }

    setCoords({ x, y })
  }, [width])

  /**
   * 打开菜单
   */
  const handleOpen = useCallback((event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

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

    /** 先设置一个初始位置，避免闪烁 */
    setCoords({ x: event.clientX, y: event.clientY })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calculatePosition(event.clientX, event.clientY)
      })
    })
  }, [calculatePosition, onOpen, isControlled, onOpenChange])

  /**
   * 关闭菜单
   */
  const handleClose = useCallback(() => {
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
  }, [onClose, isControlled, onOpenChange])

  /**
   * 处理菜单内容点击，如果启用 closeOnClick 则关闭菜单
   */
  const handleMenuClick = useCallback((event: React.MouseEvent) => {
    if (closeOnClick) {
      /** 阻止事件冒泡，避免触发 useClickOutside */
      event.stopPropagation()
      handleClose()
    }
  }, [closeOnClick, handleClose])

  /**
   * 监听全局右键事件（仅在非受控模式下）
   */
  useEffect(() => {
    /** 受控模式下不监听全局事件 */
    if (isControlled)
      return

    const handleContextMenu = (event: MouseEvent) => {
      handleOpen(event)
    }

    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [handleOpen, isControlled])

  /**
   * 监听滚动和窗口大小变化，更新菜单位置
   */
  useEffect(() => {
    if (!isOpen)
      return

    const handleUpdatePosition = () => {
      if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect()
        calculatePosition(rect.left, rect.top)
      }
    }

    window.addEventListener('scroll', handleUpdatePosition, true)
    window.addEventListener('resize', handleUpdatePosition)

    return () => {
      window.removeEventListener('scroll', handleUpdatePosition, true)
      window.removeEventListener('resize', handleUpdatePosition)
    }
  }, [isOpen, calculatePosition])

  /**
   * 点击外部关闭菜单
   */
  useClickOutside(
    [menuRef as RefObject<HTMLDivElement>],
    handleClose,
    {
      enabled: isOpen,
    },
  )

  /**
   * 清理函数
   */
  onUnmounted(() => {
    if (!isControlled) {
      setInternalOpen(false)
    }
  })

  /**
   * 暴露给外部的方法
   */
  useImperativeHandle(ref, () => ({
    open: (event: MouseEvent) => {
      handleOpen(event)
    },
    close: handleClose,
  }))

  /**
   * 菜单动画变体
   */
  const variants: Variants = {
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

  return (
    <AnimateShow
      show={ isOpen }
      ref={ menuRef }
      className={ cn(
        'fixed z-50 rounded-lg bg-background border border-border shadow-lg',
        className,
      ) }
      style={ {
        left: coords.x,
        top: coords.y,
        width: `${width}px`,
        ...style,
      } }
      variants={ variants }
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
   * @default false
   */
  closeOnClick?: boolean
  /**
   * 受控模式：菜单是否打开
   * 当提供此 prop 时，组件进入受控模式，不会监听全局 contextmenu 事件
   */
  open?: boolean
  /**
   * 受控模式：菜单打开状态变化时的回调
   */
  onOpenChange?: (open: boolean) => void
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
