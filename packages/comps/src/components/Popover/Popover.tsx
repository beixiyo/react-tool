'use client'

import { useTheme } from 'hooks'
import { memo, useId, useRef } from 'react'
import { cn } from 'utils'
import { KeyboardLayerHostContext } from '../../hooks/useKeyboardLayerHost'
import { AnimateShow } from '../Animate'
import { FloatingArrow, useFloatingLayer } from '../FloatingArrow'
import { SafePortal } from '../SafePortal'
import { usePopoverInteractions } from './hooks/usePopoverInteractions'
import { useScrollPortal } from './hooks/useScrollPortal'
import { getVariantByPlacement } from './styles'
import type { PopoverProps } from './types'
import { injectTriggerAria } from './utils'

const DEFAULT_CLOSE_KEYS = ['Escape']

/**
 * Popover 组件，用于在触发器元素旁边显示浮动内容
 */
export const Popover = memo(({ ref, ...props }: PopoverProps) => {
  const [theme] = useTheme()
  const {
    style,
    className,
    contentClassName,
    contentStyle,

    children,
    content,
    position = 'top',
    align = 'center',
    trigger = 'hover',
    disabled,
    removeDelay = 200,
    showDelay = 0,
    offset: offsetProp = 8,

    clickOutsideToClose = true,
    closeKeys = DEFAULT_CLOSE_KEYS,
    onOpen,
    onClose,
    open,
    defaultOpen,
    onOpenChange,

    virtualReferenceRect,
    clickOutsideIgnoreSelector,
    followScroll = false,
    animationFrame = false,
    restoreFocusOnOpen = false,
    exitSetMode = false,
    bordered = theme !== 'light',
    arrow = true,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  } = props
  const contentId = useId()
  /** hover 浮层只是补充说明；点击 / 命令式打开的浮层才是可交互的对话框 */
  const isDialog = trigger === 'click' || trigger === 'command'
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const {
    isOpen,
    triggerProps,
    floatingProps,
    layerPriority,
  } = usePopoverInteractions({
    popoverRef: ref,
    triggerRef,
    contentRef,
    trigger,
    disabled,
    removeDelay,
    showDelay,
    clickOutsideToClose,
    closeKeys,
    clickOutsideIgnoreSelector,
    restoreFocusOnOpen,
    contentStyle,
    onOpen,
    onClose,
    open,
    defaultOpen,
    onOpenChange,
  })

  const { scrollPortalTarget, scrollContainerRef } = useScrollPortal(
    triggerRef,
    followScroll,
    isOpen,
  )

  const {
    style: floatingStyle,
    placement: actualPosition,
    arrowProps,
  } = useFloatingLayer(triggerRef, contentRef, {
    enabled: isOpen,
    placement: align === 'center'
      ? position
      : `${position}-${align}`,
    offset: offsetProp,
    arrow,
    bordered,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    animationFrame,
    scrollCapture: true,
    strategy: 'fixed',
    virtualReferenceRect,
    containerRef: followScroll
      ? scrollContainerRef
      : undefined,
  })

  const variants = getVariantByPlacement(actualPosition)

  /** 展开状态优先挂到真正获得焦点的子元素上，无法注入时回退到包裹层 */
  const triggerAria = {
    'aria-haspopup': isDialog
      ? 'dialog' as const
      : undefined,
    'aria-expanded': isDialog
      ? isOpen
      : undefined,
    'aria-controls': isOpen
      ? contentId
      : undefined,
  }
  const { children: triggerChildren, injected } = injectTriggerAria(children, triggerAria)

  return (
    <>
      <div
        style={ style }
        ref={ triggerRef }
        className={ className }
        { ...(injected
          ? undefined
          : triggerAria) }
        { ...triggerProps }
      >
        { triggerChildren }
      </div>

      <SafePortal
        target={ followScroll
          ? scrollPortalTarget
          : undefined }
      >
        <AnimateShow
          show={ isOpen }
          ref={ contentRef }
          id={ contentId }
          role={ isDialog
            ? 'dialog'
            : undefined }
          aria-label={ isDialog
            ? ariaLabel
            : undefined }
          aria-labelledby={ isDialog
            ? ariaLabelledby
            : undefined }
          /** 只有 click 模式会把焦点移入浮层，需要容器可作为兜底焦点；命令式（如选区工具栏）不能被点击抢焦点 */
          tabIndex={ trigger === 'click'
            ? -1
            : undefined }
          className={ cn(
            'z-popover rounded-2xl outline-none bg-background drop-shadow-card',
            bordered && 'border border-border',
            contentClassName,
            arrowProps && 'overflow-visible',
          ) }
          style={ {
            ...floatingStyle,
            ...contentStyle,
          } }
          variants={ variants }
          exitSetMode={ exitSetMode }
          { ...floatingProps }
        >
          { arrowProps && <FloatingArrow { ...arrowProps } /> }

          { /* 气泡里的 Select 等嵌套浮层据此把键盘优先级抬到气泡之上，Esc 先关它们再关气泡 */ }
          <KeyboardLayerHostContext.Provider value={ layerPriority }>
            { content }
          </KeyboardLayerHostContext.Provider>
        </AnimateShow>
      </SafePortal>
    </>
  )
})

Popover.displayName = 'Popover'
