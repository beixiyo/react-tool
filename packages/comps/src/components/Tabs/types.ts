/**
 * Tabs 相关类型定义
 */
import type { CSSProperties, ReactNode } from 'react'

/**
 * Tabs 内容项
 * @default {}
 */
export type TabsContentItem = {
  value: string
  children?: ReactNode
  key?: string
}

/**
 * Tabs Content 属性
 * @default {}
 */
export type TabsContentProps = {
  className?: string
  style?: CSSProperties
  items: TabsContentItem[]
  /**
   * 当前激活值
   * @default undefined
   */
  activeValue?: string
  /**
   * 是否启用 KeepAlive 缓存
   * @default true
   */
  keepAlive?: boolean
  /**
   * 动画时长（秒）
   * @default 0.4
   */
  duration?: number
  /**
   * 内容项容器类名
   * @default undefined
   */
  itemClassName?: string
  /**
   * 内容项容器样式
   * @default undefined
   */
  itemStyle?: CSSProperties
}

/**
 * 旧 Tabs 数据结构（兼容内部组件使用）
 * @default {}
 */
export type TabItemType<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
  /**
   * 指定为激活状态
   * @default undefined
   */
  active?: boolean
  children?: ReactNode
  header?: (item: Omit<TabItemType<T>, 'header'>) => ReactNode
}

/**
 * Tabs 属性
 * @default {}
 */
export type TabsProps<T extends string> = {
  className?: string
  style?: CSSProperties
  headerClass?: string
  itemClass?: string
  headerWrapClass?: string
  headerStyle?: CSSProperties

  headerAfter?: ReactNode

  /** 活跃标签的类名 */
  activeClassName?: string
  /** 非活跃标签的类名 */
  inactiveClassName?: string
  /** 底部横条的渐变色数组 */
  colors?: string[]

  /**
   * 标签高度
   * @default 56
   */
  tabHeight?: number
  items: TabItemType<T>[]
  activeKey?: T
  onChange?: (item: TabItemType<T>) => void
  /**
   * 是否启用 KeepAlive 缓存
   * @default true
   */
  keepAlive?: boolean
  /**
   * 动画时长（秒）
   * @default 0.4
   */
  duration?: number
  dataId?: string
  /**
   * 最大可见标签数，超出部分将显示在下拉菜单中
   * @default undefined
   */
  maxVisibleTabs?: number
}
