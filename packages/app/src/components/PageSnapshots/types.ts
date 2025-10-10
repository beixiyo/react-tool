import type { PageInfo } from './tools/getPageInfo'
import type { ComponentSnap } from './tools/getPageSnaps'

/**
 * 截图卡片状态枚举
 *
 * 定义了卡片在加载过程中的各种状态
 */
export type SnapshotCardStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 截图卡片数据接口
 *
 * 包含页面信息、截图数据、状态和错误信息
 */
export interface SnapshotCardData {
  /** 页面信息，包含标题、路径、描述等 */
  pageInfo: PageInfo
  /** 截图数据，可选 */
  snapshot?: ComponentSnap
  /** 卡片当前状态 */
  status: SnapshotCardStatus
  /** 错误信息，当状态为 error 时使用 */
  error?: string
}

/**
 * 页面截图展示组件属性
 *
 * 配置组件的显示行为、布局和交互功能
 */
export interface PageSnapshotsProps {
  /** 自定义类名，用于样式定制 */
  className?: string
  /** 自定义样式对象 */
  style?: React.CSSProperties
  /** 是否显示加载状态，默认 true */
  showLoading?: boolean
  /** 是否显示错误状态，默认 true */
  showError?: boolean
  /** 响应式网格列数配置 */
  gridCols?: {
    /** 小屏幕列数，默认 1 */
    sm?: number
    /** 中等屏幕列数，默认 2 */
    md?: number
    /** 大屏幕列数，默认 3 */
    lg?: number
    /** 超大屏幕列数，默认 4 */
    xl?: number
  }
  /** 分页配置 */
  pagination?: {
    /** 每页显示数量，默认 40 */
    pageSize?: number
    /** 是否启用分页，默认 true */
    enabled?: boolean
    /** 当前页码 (内部使用) */
    currentPage?: number
    /** 总页数 (内部使用) */
    totalPages?: number
    /** 页码变化回调 (内部使用) */
    onPageChange?: (page: number) => void
  }
  /** 卡片点击回调函数 */
  onCardClick?: (pageInfo: PageInfo) => void
}

/**
 * 截图卡片组件属性
 *
 * 单个页面卡片的配置选项
 */
export interface SnapshotCardProps {
  /** 卡片数据，包含页面信息和状态 */
  data: SnapshotCardData
  /** 点击回调函数 */
  onClick?: (pageInfo: PageInfo) => void
  /** 自定义类名 */
  className?: string
  /** 是否显示详细信息，默认 false */
  showDetails?: boolean
}

/**
 * 截图网格组件属性
 *
 * 网格布局容器的配置选项
 */
export interface SnapshotGridProps {
  /** 卡片数据列表 */
  cards: SnapshotCardData[]
  /** 响应式网格列数配置 */
  gridCols?: PageSnapshotsProps['gridCols']
  /** 分页配置 */
  pagination?: PageSnapshotsProps['pagination']
  /** 卡片点击回调函数 */
  onCardClick?: (pageInfo: PageInfo) => void
  /** 自定义类名 */
  className?: string
}

/**
 * 加载状态组件属性
 *
 * 用于显示加载中的状态
 */
export interface LoadingStateProps {
  /** 加载提示文本，默认 "加载中..." */
  text?: string
  /** 自定义类名 */
  className?: string
  /** 是否显示进度条，默认 false */
  showProgress?: boolean
  /** 当前进度值 (0-100) */
  progress?: number
  /** 总数量，用于计算百分比 */
  total?: number
}

/**
 * 错误状态组件属性
 *
 * 用于显示错误信息和重试选项
 */
export interface ErrorStateProps {
  /** 错误提示信息 */
  message?: string
  /** 重试按钮点击回调 */
  onRetry?: () => void
  /** 自定义类名 */
  className?: string
}
