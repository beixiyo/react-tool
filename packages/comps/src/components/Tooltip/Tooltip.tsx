'use client'

import { motion } from 'motion/react'
import { memo, useId } from 'react'
import { cn } from 'utils'
import { MOTION_TRANSITIONS } from '../Animate'
import { FloatingArrow } from '../FloatingArrow'
import { injectTriggerAria } from '../Popover/utils'
import { SafePortal } from '../SafePortal'
import { useTooltip } from './hooks/useTooltip'
import { TOOLTIP_OFFSET, TOOLTIP_SURFACE_CLASS } from './styles'
import type { TooltipProps } from './types'

export const Tooltip = memo<TooltipProps>((props) => {
  const {
    children,
    content,
    placement,
    open,
    defaultOpen,
    onOpenChange,
    trigger = 'hover',
    disabled = false,
    offset = TOOLTIP_OFFSET,
    className,
    contentClassName,
    zIndex,
    arrow = true,
    formatter,
    delay = 0,
    autoHideOnResize = false,
    interactive = false,
    escToClose = true,
    ...rest
  } = props

  const {
    shouldShow,
    style,
    arrowProps,
    triggerRef,
    tooltipRef,
    triggerProps,
  } = useTooltip({
    placement,
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    disabled,
    offset,
    arrow,
    delay,
    autoHideOnResize,
    escToClose,
    zIndex,
  })

  /** 格式化内容 */
  const formattedContent = formatter && typeof content === 'number'
    ? formatter(content)
    : content

  /**
   * Tooltip 内容
   * 用显式判空而非真值判断，避免数字 0 / 空字符串等合法内容被吞掉
   */
  const hasContent = formattedContent != null && formattedContent !== ''
  const tooltipId = useId()
  /** 只在提示真正渲染时关联，避免指向不存在的节点 */
  const describedBy = shouldShow && hasContent
    ? tooltipId
    : undefined
  const tooltipContent = shouldShow && hasContent
    ? (
      <motion.div
        ref={ tooltipRef }
        id={ tooltipId }
        role="tooltip"
        initial={ { opacity: 0, scale: 0.8 } }
        animate={ { opacity: 1, scale: 1 } }
        transition={ MOTION_TRANSITIONS.floatingEnter }
        className={ cn(
          'fixed z-tooltip',
          TOOLTIP_SURFACE_CLASS,
          /** 默认不拦截指针事件；interactive 时允许浮层内交互（点击链接/按钮等） */
          interactive
            ? 'pointer-events-auto'
            : 'pointer-events-none',
          contentClassName,
        ) }
        style={ { ...style, zIndex } }
      >
        { formattedContent }

        { /* 与其他浮层共用同一套尖角绘制和接缝处理 */ }
        { arrowProps && <FloatingArrow { ...arrowProps } /> }
      </motion.div>
    )
    : null

  /** 描述关系优先挂到真正获得焦点的子元素上，与其已有的 aria-describedby 合并；无法注入时回退到包裹层 */
  const { children: triggerChildren, injected } = injectTriggerAria(children, { 'aria-describedby': describedBy })

  return (
    <>
      { /* 触发元素 */ }
      <div
        ref={ triggerRef }
        className={ cn('inline-block', className) }
        aria-describedby={ injected
          ? undefined
          : describedBy }
        { ...triggerProps }
        { ...rest }
      >
        { triggerChildren }
      </div>

      { /* 使用 Portal 渲染到 body，避免定位和层级问题 */ }
      <SafePortal>
        { tooltipContent }
      </SafePortal>
    </>
  )
})

Tooltip.displayName = 'Tooltip'

/** 类型定义 */
