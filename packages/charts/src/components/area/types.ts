import type { CartesianChartBaseProps } from '../cartesian-chart-base'
import type { Margin } from '../types/chart'

export interface AreaProps {
  /** 用于读取 y 值的数据字段 key */
  dataKey: string
  /** 区域渐变起始颜色，默认：var(--chart-line-primary) */
  fill?: string
  /** 区域顶部的不透明度，默认：0.4 */
  fillOpacity?: number
  /** 轮廓线颜色，默认与 fill 相同 */
  stroke?: string
  /** 轮廓线宽度，默认：2 */
  strokeWidth?: number
  /** 曲线函数，默认：curveMonotoneX */
  curve?: any
  /** 是否启用区域生长动画，默认：true */
  animate?: boolean
  /** 是否渲染顶部轮廓线，默认：true */
  showLine?: boolean
  /** 是否在悬停/选择时高亮一小段线段，默认：true */
  showHighlight?: boolean
  /** 底部渐变终点不透明度（0 表示完全透明），默认：0 */
  gradientToOpacity?: number
  /** 是否在左右边缘淡出填充区域，默认：false */
  fadeEdges?: boolean
}

export type AreaChartProps = {
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
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>

export interface GridProps {
  /** 是否显示水平网格线，默认：true */
  horizontal?: boolean
  /** 是否显示垂直网格线，默认：false */
  vertical?: boolean
  /** 水平网格线数量，默认：5 */
  numTicksRows?: number
  /** 垂直网格线数量，默认：10 */
  numTicksColumns?: number
  /** 网格线颜色，默认：var(--chart-grid) */
  stroke?: string
  /** 网格线不透明度，默认：1 */
  strokeOpacity?: number
  /** 网格线宽度，默认：1 */
  strokeWidth?: number
  /** 虚线样式，默认："4,4"（短虚线） */
  strokeDasharray?: string
  /** 是否为水平网格线开启左右渐隐效果，默认：true */
  fadeHorizontal?: boolean
  /** 是否为垂直网格线开启上下渐隐效果，默认：false */
  fadeVertical?: boolean
}

export interface XAxisProps {
  /** 需要展示的刻度数量（包含首尾），默认：5 */
  numTicks?: number
  /** 底部日期胶囊的半宽，用于计算淡出范围，默认：50 */
  tickerHalfWidth?: number
}

export interface XAxisLabelProps {
  label: string
  x: number
  crosshairX: number | null
  isHovering: boolean
  tickerHalfWidth: number
}
