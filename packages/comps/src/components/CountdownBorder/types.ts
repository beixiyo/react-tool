import type { MotionValue } from 'motion/react'

export type CountdownBorderProps = {
  /**
   * 边框视图宽度
   * @default 360
   */
  width?: number
  /**
   * 边框视图高度
   * @default 64
   */
  height?: number
  /**
   * 圆角半径
   * @default 16
   */
  radius?: number
  /**
   * 描边宽度
   * @default 2
   */
  strokeWidth?: number
  /**
   * 顶边起点横坐标
   * @default width * 0.35
   */
  startX?: number
  /**
   * 受控进度，取值 0-1；不传时组件按 duration 自动倒计时
   */
  progress?: number | MotionValue<number>
  /**
   * 自动倒计时时长，单位毫秒
   * @default 8000
   */
  duration?: number
  /**
   * 自动倒计时是否运行
   * @default true
   */
  running?: boolean
  /**
   * 变化时重置非受控倒计时
   */
  resetKey?: React.Key
  /**
   * SVG path 线帽
   * @default 'round'
   */
  strokeLinecap?: React.SVGAttributes<SVGPathElement>['strokeLinecap']
  /**
   * 内容区域 className
   */
  contentClassName?: string
  /**
   * 内容区域内联样式（供需从常量推导的几何值使用，如内缩 margin / 高度 / 圆角）
   */
  contentStyle?: React.CSSProperties
  /**
   * SVG 元素 className
   */
  svgClassName?: string
  /**
   * 倒计时 path className
   * @default 'stroke-brand'
   */
  pathClassName?: string
  /**
   * 非受控倒计时结束回调
   */
  onComplete?: () => void
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
