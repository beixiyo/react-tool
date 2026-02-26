'use client'

import type { ReactNode } from 'react'
import type { CartesianChartBaseProps } from '../cartesian-chart-base'
import type { Margin } from '../types/chart'

export interface LineProps {
  /** 用于读取 y 值的数据字段 key */
  dataKey: string
  /** 线条颜色，默认：var(--chart-line-primary) */
  stroke?: string
  /** 线条宽度，默认：2.5 */
  strokeWidth?: number
  /** 曲线函数，默认：curveNatural */
  // biome-ignore lint/suspicious/noExplicitAny: 复用 visx 的 CurveFactory any 定义
  curve?: any
  /** 是否启用线条生长动画，默认：true */
  animate?: boolean
  /** 是否在两端使用渐变淡出效果，默认：true */
  fadeEdges?: boolean
  /** 是否在悬停/选择时高亮一小段线段，默认：true */
  showHighlight?: boolean
}

export interface LineChartProps extends React.HTMLAttributes<HTMLElement> {
  /** 数据数组，每一项应包含日期字段以及若干数值字段 */
  data: Record<string, unknown>[]
  /** x 轴使用的数据字段（日期），默认："date" */
  xDataKey?: string
  /** 图表边距 */
  margin?: Partial<Margin>
  /** 动画时长（毫秒），默认：1100 */
  animationDuration?: number
  /** 虚拟滚动配置 */
  virtual?: CartesianChartBaseProps['virtual']
  /** 子组件（Line、Grid、ChartTooltip 等） */
  children: ReactNode
}
