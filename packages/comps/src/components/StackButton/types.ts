import type { CSSProperties, ReactNode } from 'react'
import type { Size } from '../../types'

export interface ToggleItem {
  id: string
  icon: ReactNode
  /** 每一项自定义类名 */
  className?: string
}

export interface StackButtonProps {
  /** 切换项数组 */
  items: ToggleItem[]
  /** 当前激活项的 id */
  activeId?: string
  /** 默认激活项的 id（非受控模式） */
  defaultActiveId?: string
  /** 激活项变化时的回调 */
  onActiveChange?: (id: string) => void
  /**
   * 尺寸或按钮大小（像素）
   * @default 'md'
   */
  size?: Size
  /** 按钮宽度（像素），优先级高于 size */
  width?: number
  /** 按钮高度（像素），优先级高于 size */
  height?: number
  /** 堆叠的非激活按钮之间的重叠边距（负值） */
  overlapMargin?: number
  /** 激活按钮与相邻按钮之间的间距 */
  activeGap?: number
  /** 圆角半径（像素） */
  borderRadius?: number
  /** 图标大小类名（Tailwind） */
  iconSize?: string
  /** 图标描边宽度 */
  iconStrokeWidth?: number
  /** 激活按钮背景色 */
  activeBackground?: string
  /** 非激活按钮背景色 */
  inactiveBackground?: string
  /** 激活按钮边框色 */
  activeBorderColor?: string
  /** 非激活按钮边框色 */
  inactiveBorderColor?: string
  /** 激活图标颜色 */
  activeIconColor?: string
  /** 非激活图标颜色 */
  inactiveIconColor?: string
  /** 激活按钮阴影 */
  activeShadow?: string
  /** 非激活按钮阴影 */
  inactiveShadow?: string
  /** 布局动画的弹簧刚度 */
  springStiffness?: number
  /** 布局动画的弹簧阻尼 */
  springDamping?: number
  /** 布局动画的弹簧质量 */
  springMass?: number
  /** 颜色过渡的持续时间 */
  colorTransitionDuration?: number
  /** 额外的类名 */
  className?: string
  /** 按钮项的基础类名 */
  itemClassName?: string
  /**
   * 激活项的类名
   * @default 'bg-button border-0'
   */
  activeClassName?: string
  /**
   * 非激活项的类名
   * @default 'bg-button2 border-0'
   */
  inactiveClassName?: string
  /**
   * 位于激活项左侧的项的类名
   * @default 'border-l border-border'
   */
  leftClassName?: string
  /**
   * 位于激活项右侧的项的类名
   * @default ''
   */
  rightClassName?: string
  /**
   * 位于激活项左侧且非第一项的类名（堆叠项）
   * @default 'border-l border-border2'
   */
  stackedLeftClassName?: string
  /**
   * 位于激活项右侧且非最后一项的类名（堆叠项）
   * @default 'border-r border-border2'
   */
  stackedRightClassName?: string
  /**
   * 位于激活项左侧且非第一项时的行内样式（堆叠项）
   */
  stackedLeftStyle?: CSSProperties
  /**
   * 位于激活项右侧且非最后一项时的行内样式（堆叠项）
   */
  stackedRightStyle?: CSSProperties
}
