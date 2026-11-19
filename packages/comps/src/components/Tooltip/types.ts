/**
 * Tooltip 类型声明
 */

import type * as React from 'react'
import type { FloatingArrowConfig } from '../FloatingArrow'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TooltipTrigger = 'hover' | 'focus' | 'click'

export type TooltipProps = {
  /**
   * 触发元素
   *
   * 为单个 React 元素时，显示期间 `aria-describedby` 会合并注入到该元素上
   * （子元素需把未知 props 透传到 DOM）；否则挂在包裹层
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
   * 是否显示
   */
  open?: boolean
  /**
   * 非受控时的初始显示状态
   * @default false
   */
  defaultOpen?: boolean
  /** 显示状态变化（悬停、聚焦、点击、Esc 等）时回调；受控与非受控都会触发 */
  onOpenChange?: (open: boolean) => void
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
   * 目标元素到浮层可见边缘的间距，单位 px
   *
   * 开启箭头时以箭头尖端为准，关闭箭头时以面板边缘为准，两种状态视觉间距一致
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
  /** 浮层层级；不传时使用默认 tooltip 层级 */
  zIndex?: number
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
  /**
   * 按 Esc 是否关掉浮层
   *
   * 进的是与 Modal / Popover 同一个键盘层栈，优先级取 `z-tooltip`：Tooltip 在视觉上压过一切，
   * 开着时第一下 Esc 只关它，第二下才轮到底下的弹窗。受控（`open`）时只有同时传了
   * `onOpenChange` 才响应（通过它请求关闭）；没有回传口时不占栈顶，避免把底下的 Esc 永远吃掉
   * @default true
   */
  escToClose?: boolean
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'content'>
