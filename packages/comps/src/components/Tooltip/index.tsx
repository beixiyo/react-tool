'use client'

import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
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

  /**
   * 获取箭头样式
   *
   * 箭头是一个旋转 45° 的小方块（菱形），复用 Tooltip 的 `bg-background`，
   * 让深浅色模式自动适配。通过半重叠 + 负 z-index 隐藏靠内的两条边，
   * 只露出朝外的尖角，从而形成类似对话框的尖尖角，与无边框气泡自然衔接
   */
  const getArrowStyle = (placement: TooltipPlacement) => {
    switch (placement) {
      case 'top':
        return { bottom: 0, left: '50%', transform: 'translate(-50%, 50%) rotate(45deg)' }
      case 'bottom':
        return { top: 0, left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }
      case 'left':
        return { right: 0, top: '50%', transform: 'translate(50%, -50%) rotate(45deg)' }
      case 'right':
        return { left: 0, top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }
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
            'fixed z-tooltip px-2.5 py-1.5 rounded-lg pointer-events-none w-max max-w-[60vw] wrap-break-word text-xs',
            /** 深色模式黑底、浅色模式白底，自动跟随主题 */
            'bg-background text-text shadow-card',
            contentClassName,
          ) }
          style={ style }
        >
          { formattedContent }

          {/* 类似对话框的尖尖角：旋转方块，复用气泡的底色，与无边框气泡保持一致 */ }
          { arrow && resolvedPlacement && (
            <div
              className="absolute z-[-1] size-2 bg-background"
              style={ getArrowStyle(resolvedPlacement) }
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
   * @default false
   */
  arrow?: boolean
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
