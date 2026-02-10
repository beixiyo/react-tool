import type { HTMLAttributes } from 'react'
import type { StackedCardsProps } from '../Card'

/**
 * 收起态 StackedCards 的可配置项（由 Dropdown 内部注入 layersContent，故排除）
 */
export type CollapsedStackedCardsConfig = Partial<
  Omit<StackedCardsProps, 'layersContent' | 'children'>
>

export interface DropdownItem {
  /** 唯一标识符 */
  id: string
  /** 标题/标签 */
  label?: string
  /** 描述文本 */
  desc?: string
  /** 时间戳 */
  timestamp?: Date | string | number
  /** 标签文本 */
  tag?: string
  /** 标签颜色 (Tailwind CSS 类名) */
  tagColor?: string
  /** 自定义渲染内容，如果提供，将覆盖默认渲染 */
  customContent?: React.ReactNode
}

export interface DropdownSection {
  /** 分区名称，将作为可折叠的标题显示 */
  name: string
  /** 分区下的项目，可以是项目数组或自定义的React节点 */
  items: DropdownItem[] | React.ReactNode
  /**
   * 收起态预览专用 items（优先于 items）
   * @default undefined
   */
  collapsedPreviewItems?: DropdownItem[]
  /**
   * 收起态预览专用内容（支持传入数组以渲染多层堆叠）
   * @default undefined
   */
  collapsedPreviewContent?: React.ReactNode | React.ReactNode[]
  /** 自定义分区头部，如果提供，将覆盖默认渲染 */
  header?: React.ReactNode | ((isExpanded: boolean) => React.ReactNode)
  /** 分区内容区域的最大高度，支持滚动 */
  maxHeight?: string | number
}

export interface DropdownProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  /**
   * 下拉菜单的数据源。
   * 可以是 `Record<string, DropdownItem[] | React.ReactNode>` 形式的对象，
   * 也可以是 `DropdownSection[]` 形式的数组。
   */
  items:
    | Record<string, DropdownItem[] | React.ReactNode>
    | DropdownSection[]

  /** 应用于每个可折叠分区容器的自定义CSS类 */
  itemClassName?: string
  /** 应用于分区标题的自定义CSS类 */
  sectionHeaderClassName?: string
  /** 应用于项目标题的自定义CSS类 */
  itemTitleClassName?: string
  /** 应用于项目描述的自定义CSS类 */
  itemDescClassName?: string
  /** 应用于选中项目的自定义CSS类 */
  itemActiveClassName?: string
  /** 应用于未选中项目的自定义CSS类 */
  itemInactiveClassName?: string

  /** 当前选中的项目ID */
  selectedId?: string | null
  /** 项目点击事件的回调函数 */
  onClick?: (id: string) => void
  /**
   * 是否启用手风琴模式，一次只能展开一个部分。
   * @default true
   */
  accordion?: boolean

  /** 默认展开的分区名称数组 */
  defaultExpanded?: string[]
  /** 分区展开/收起状态改变时的回调函数 */
  onExpandedChange?: (expandedSections: string[]) => void
  /** 自定义项目渲染函数 */
  renderItem?: (item: DropdownItem) => React.ReactNode
  /**
   * 为每个分区设置最大高度，支持滚动。
   * 可以是字符串（所有分区统一高度）或对象（按分区名称设置不同高度）
   * @example '300px' | { 'section1': '200px', 'section2': '400px' }
   */
  sectionMaxHeight?: string | number | Record<string, string | number>
  /**
   * 收起时展示预览卡片
   * @default false
   */
  collapsedPreview?: boolean
  /**
   * 收起态预览是否可点击展开
   * @default true
   */
  collapsedPreviewClickable?: boolean
  /**
   * 收起态预览容器的 className
   * @default ''
   */
  collapsedPreviewClassName?: string
  /**
   * 自定义收起态预览项渲染
   */
  renderCollapsedItem?: (item: DropdownItem) => React.ReactNode
  /**
   * 自定义收起态预览内容（适用于 items 为 ReactNode 的场景）
   */
  renderCollapsedContent?: (section: DropdownSection) => React.ReactNode | React.ReactNode[]
  /**
   * 收起态 StackedCards 的完整配置（层数、偏移、样式等均在此配置）
   */
  collapsedStackedCards?: CollapsedStackedCardsConfig
}
