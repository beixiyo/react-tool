'use client'

import { motion } from 'motion/react'
import { memo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { useTooltip } from './useTooltip'

export const Tooltip = memo<TooltipProps>((props) => {
  const {
    children,
    content,
    placement = 'top',
    visible,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    theme = 'dark',
    className,
    contentClassName,
    arrow = false,
    formatter,
    delay = 0,
    autoHideOnResize = false,
    ...rest
  } = props

  const {
    shouldShow,
    style,
    triggerRef,
    tooltipRef,
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

  /** 获取箭头样式 */
  const getArrowStyle = () => {
    const arrowSize = 6
    // 使用 text token：浅色模式是黑色，深色模式是白色
    const arrowColor = 'rgba(var(--text) / 0.8)'

    switch (placement) {
      case 'top':
        return {
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid ${arrowColor}`,
        }
      case 'bottom':
        return {
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid ${arrowColor}`,
        }
      case 'left':
        return {
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid ${arrowColor}`,
        }
      case 'right':
        return {
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid ${arrowColor}`,
        }
      default:
        return {}
    }
  }

  /** 格式化内容 */
  const formattedContent = formatter && typeof content === 'number'
    ? formatter(content)
    : content

  /** Tooltip 内容 */
  const tooltipContent = shouldShow && formattedContent
    ? (
        <motion.div
          ref={ tooltipRef }
          initial={ { opacity: 0, scale: 0.8 } }
          animate={ { opacity: 1, scale: 1 } }
          exit={ { opacity: 0, scale: 0.8 } }
          transition={ { duration: 0.15 } }
          className={ cn(
            'fixed z-50 px-2 py-2 rounded-lg shadow-lg pointer-events-none w-max max-w-[60vw] wrap-break-word text-xs',
            // 浅色模式用黑色背景（text），深色模式用白色背景（text）
            // 文字颜色使用 background token：浅色模式是白色，深色模式是黑色
            'bg-text text-background',
            contentClassName,
          ) }
          style={ style }
        >
          { formattedContent }

          {/* 箭头 */ }
          { arrow && (
            <div
              className="absolute h-0 w-0"
              style={ getArrowStyle() }
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
      { tooltipContent && createPortal(tooltipContent, document.body) }
    </>
  )
})

Tooltip.displayName = 'Tooltip'

/** 类型定义 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipTrigger = 'hover' | 'focus' | 'click'
export type TooltipTheme = 'dark' | 'light'

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
   * 是否显示箭头
   * @default true
   */
  arrow?: boolean
  /**
   * 主题
   * @default 'dark'
   */
  theme?: TooltipTheme
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
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>
