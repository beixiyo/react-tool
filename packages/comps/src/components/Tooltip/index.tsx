'use client'

import type { FloatingArrowConfig } from '../FloatingArrow'
import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import {
  FloatingArrow,
  useFloatingArrowState,
} from '../FloatingArrow'
import { SafePortal } from '../SafePortal'
import { useTooltip } from './useTooltip'

export const Tooltip = memo<TooltipProps>((props) => {
  const {
    children,
    content,
    placement,
    visible,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    className,
    contentClassName,
    arrow = true,
    formatter,
    delay = 0,
    autoHideOnResize = false,
    interactive = false,
    ...rest
  } = props

  const {
    shouldShow,
    style,
    triggerRef,
    tooltipRef,
    placement: resolvedPlacement,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleClick,
  } = useTooltip({
    placement,
    visible,
    trigger,
    disabled,
    offset,
    delay,
    autoHideOnResize,
  })
  const {
    options: arrowOptions,
    centerOffset: arrowCenterOffset,
    fill: arrowFill,
    style: arrowStyle,
  } = useFloatingArrowState({
    arrow,
    enabled: shouldShow,
    placement: resolvedPlacement,
    floatingStyle: style,
    referenceRef: triggerRef,
    floatingRef: tooltipRef,
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
  const tooltipContent = shouldShow && hasContent
    ? (
        <motion.div
          ref={ tooltipRef }
          initial={ { opacity: 0, scale: 0.8 } }
          animate={ { opacity: 1, scale: 1 } }
          exit={ { opacity: 0, scale: 0.8 } }
          transition={ { duration: 0.15 } }
          className={ cn(
            'fixed z-tooltip px-2.5 py-1.5 rounded-lg w-max max-w-[60vw] wrap-break-word text-xs',
            /** 默认不拦截指针事件；interactive 时允许浮层内交互（点击链接/按钮等） */
            interactive
              ? 'pointer-events-auto'
              : 'pointer-events-none',
            /** 深色模式黑底、浅色模式白底，自动跟随主题 */
            'bg-background text-text drop-shadow-card',
            contentClassName,
          ) }
          style={ style }
        >
          { formattedContent }

          {/* 与其他浮层共用同一套尖角绘制和接缝处理 */ }
          { arrowOptions && resolvedPlacement && (
            <FloatingArrow
              placement={ resolvedPlacement }
              centerOffset={ arrowCenterOffset }
              size={ arrowOptions.size }
              fill={ arrowFill }
              className={ arrowOptions.className }
              style={ arrowStyle }
            />
          ) }
        </motion.div>
      )
    : null

  return (
    <>
      {/* 触发元素 */ }
      <div
        ref={ triggerRef }
        className={ cn('inline-block', className) }
        onMouseEnter={ handleMouseEnter }
        onMouseLeave={ handleMouseLeave }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onClick={ handleClick }
        { ...rest }
      >
        { children }
      </div>

      {/* 使用 Portal 渲染到 body，避免定位和层级问题 */ }
      <SafePortal>
        { tooltipContent }
      </SafePortal>
    </>
  )
})

Tooltip.displayName = 'Tooltip'

/** 类型定义 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipTrigger = 'hover' | 'focus' | 'click'

export type TooltipProps = {
  /**
   * 触发元素
   */
  children: React.ReactNode
  /**
   * Tooltip 内容
   */
  content?: React.ReactNode
  /**
   * 显示位置
   * @default 'top'
   */
  placement?: TooltipPlacement
  /**
   * 是否显示（受控模式）
   */
  visible?: boolean
  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: TooltipTrigger
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 偏移距离
   * @default 8
   */
  offset?: number
  /**
   * 容器类名
   */
  className?: string
  /**
   * 内容区域类名
   */
  contentClassName?: string
  /**
   * 是否显示类似对话框的尖尖角（箭头）
   * @default true
   */
  arrow?: FloatingArrowConfig
  /**
   * 内容格式化函数
   */
  formatter?: (value: number) => React.ReactNode
  /**
   * 显示延迟（毫秒）
   * @default 0
   */
  delay?: number
  /**
   * 当触发元素发生尺寸或位置变化时自动隐藏 Tooltip
   * @default false
   */
  autoHideOnResize?: boolean
  /**
   * 是否允许在浮层内部交互（去掉 pointer-events-none）
   * 配合 trigger='click' 在浮层中放可点击内容（链接/按钮）时开启
   * @default false
   */
  interactive?: boolean
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>
