'use client'

import { useClickOutside, useControllableState, useFloatingPosition, useFocusScope, useKeyboardLayer, useLatestCallback, useLatestRef } from 'hooks'
import type { Variants } from 'motion/react'
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react'
import { memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { useNestedLayerPriority } from '../../hooks/useKeyboardLayerHost'
import { AnimateShow } from '../Animate'
import { useMenuKeyboard } from './hooks/useMenuKeyboard'
import type { ContextMenuOpenOptions, ContextMenuPlacement, ContextMenuProps, ContextMenuTarget } from './types'

const DEFAULT_PLACEMENT: ContextMenuPlacement = 'bottom-start'

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

const InnerContextMenu = ({
  ref,
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
  target,
}: ContextMenuProps) => {
  /** 受控时以 `open` 为准；两种模式下状态变化都会通知 onOpenChange */
  const [isOpen, setOpen, isControlled] = useControllableState({
    value: open,
    defaultValue: false,
    onChange: onOpenChange,
  })
  /** 菜单内容引用 */
  const menuRef = useRef<HTMLDivElement>(null)
  /** 鼠标点击位置的虚拟 reference */
  const [virtualReference, setVirtualReference] = useState<DOMRect | null>(null)
  /** 本次打开的落位；每次 `open()` 重新归一化，不沿用上一次的选项 */
  const [placement, setPlacement] = useState<ContextMenuPlacement>(DEFAULT_PLACEMENT)

  /** 使用 useFloatingPosition 计算浮层位置 */
  const { style: floatingStyle } = useFloatingPosition(
    { current: null } as RefObject<HTMLElement | null>,
    menuRef,
    {
      enabled: isOpen && !!virtualReference,
      placement,
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
   *
   * 默认以鼠标点为虚拟 reference；传入 `options.anchor` 时改以锚元素的包围盒定位，
   * 出现在其下方、按 `options.placement` 对齐左缘或右缘，不随右键落点漂移
   */
  const handleOpen = useLatestCallback((event: MouseEvent, options?: ContextMenuOpenOptions) => {
    event.preventDefault()
    event.stopPropagation()
    setPlacement(options?.placement ?? DEFAULT_PLACEMENT)
    setOpen(true)
    onOpen?.()

    const anchor = options?.anchor
    if (anchor) {
      setVirtualReference(
        anchor instanceof Element
          ? anchor.getBoundingClientRect()
          : anchor,
      )
      return
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
    setOpen(false)
    onClose?.()
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

  /** 菜单不走 Portal，嵌在弹窗里时要压过弹窗，否则 Esc 关掉的是整个弹窗 */
  const layerPriority = useNestedLayerPriority(
    typeof style?.zIndex === 'number'
      ? style.zIndex
      : Z.dropdown,
  )

  useKeyboardLayer({
    active: isOpen,
    keys: ['Escape'],
    priority: layerPriority,
    allowRepeat: false,
    onKeyDown: handleClose,
  })

  /**
   * 打开后焦点进入菜单容器，关闭后归还给打开前的元素；
   * 菜单项之间的移动由方向键负责，不做 Tab 循环（Tab 直接关闭菜单）
   */
  useFocusScope({
    active: isOpen,
    containerRef: menuRef,
    initialFocus: 'container',
  })
  const handleMenuKeyDown = useMenuKeyboard({ menuRef, onClose: handleClose })

  /**
   * 右键入口：
   * - 传了 `target`：只在该区域内右键时打开，受控与非受控模式均生效
   * - 未传 `target` 且非受控：沿用历史行为，监听整个页面的右键
   * - 未传 `target` 且受控：不监听，由宿主通过 ref.open(event) 打开
   */
  const targetRef = useLatestRef(target)
  const hasTarget = target != null

  useEffect(() => {
    if (!hasTarget && isControlled) return

    const handleContextMenu = (event: MouseEvent) => {
      if (hasTarget && !isEventInTarget(event, targetRef.current)) return
      handleOpen(event)
    }

    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [handleOpen, hasTarget, isControlled, targetRef])

  /**
   * 点击外部关闭菜单
   */
  useClickOutside(
    [menuRef],
    handleClose,
    {
      enabled: isOpen,
      additionalSelectors: clickOutsideIgnoreSelector
        ? [clickOutsideIgnoreSelector]
        : undefined,
    },
  )

  /**
   * 暴露给外部的方法
   */
  useImperativeHandle(ref, () => ({
    open: (event: MouseEvent, options?: ContextMenuOpenOptions) => {
      handleOpen(event, options)
    },
    close: handleClose,
  }), [handleClose, handleOpen])

  return (
    <AnimateShow
      show={ isOpen }
      ref={ menuRef }
      className={ cn(
        'fixed z-dropdown flex flex-col gap-1 rounded-[20px] bg-background p-2 shadow-card',
        className,
      ) }
      role="menu"
      tabIndex={ -1 }
      display="flex"
      style={ {
        ...floatingStyle,
        width: `${width}px`,
        ...style,
      } }
      variants={ MENU_VARIANTS }
      exitSetMode
      onClick={ handleMenuClick }
      onKeyDown={ handleMenuKeyDown }
    >
      { children }
    </AnimateShow>
  )
}

InnerContextMenu.displayName = 'ContextMenu'

export const ContextMenu = memo(InnerContextMenu)

/** 右键事件是否落在 `target` 指定的区域内 */
function isEventInTarget(event: MouseEvent, target: ContextMenuTarget | undefined) {
  const node = event.target
  if (!target || !(node instanceof Node)) return false

  if (typeof target === 'string') {
    const element = node instanceof Element
      ? node
      : node.parentElement
    return !!element?.closest(target)
  }

  const element = 'current' in target
    ? target.current
    : target
  return !!element?.contains(node)
}
