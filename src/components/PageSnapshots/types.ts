import type { PageInfo } from '@/components/PageSnapshots/tools/getPageInfo'
import type { ComponentSnap } from '@/components/PageSnapshots/tools/getPageSnaps'

/**
 * 截图卡片状态
 */
export type SnapshotCardStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 截图卡片数据
 */
export interface SnapshotCardData {
  /** 页面信息 */
  pageInfo: PageInfo
  /** 截图数据 */
  snapshot?: ComponentSnap
  /** 卡片状态 */
  status: SnapshotCardStatus
  /** 错误信息 */
  error?: string
}

/**
 * 页面截图展示组件属性
 */
export interface PageSnapshotsProps {
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示错误状态 */
  showError?: boolean
  /** 网格列数配置 */
  gridCols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /** 分页配置 */
  pagination?: {
    /** 每页显示数量 */
    pageSize?: number
    /** 是否启用分页 */
    enabled?: boolean
    /** 当前页码 (内部使用) */
    currentPage?: number
    /** 总页数 (内部使用) */
    totalPages?: number
    /** 页码变化回调 (内部使用) */
    onPageChange?: (page: number) => void
  }
  /** 卡片点击回调 */
  onCardClick?: (pageInfo: PageInfo) => void
  /** 截图加载完成回调 */
  onSnapshotLoad?: (data: SnapshotCardData) => void
  /** 截图加载失败回调 */
  onSnapshotError?: (pageInfo: PageInfo, error: string) => void
}

/**
 * 截图卡片组件属性
 */
export interface SnapshotCardProps {
  /** 卡片数据 */
  data: SnapshotCardData
  /** 点击回调 */
  onClick?: (pageInfo: PageInfo) => void
  /** 自定义类名 */
  className?: string
  /** 是否显示详细信息 */
  showDetails?: boolean
}

/**
 * 截图网格组件属性
 */
export interface SnapshotGridProps {
  /** 卡片数据列表 */
  cards: SnapshotCardData[]
  /** 网格列数配置 */
  gridCols?: PageSnapshotsProps['gridCols']
  /** 分页配置 */
  pagination?: PageSnapshotsProps['pagination']
  /** 卡片点击回调 */
  onCardClick?: (pageInfo: PageInfo) => void
  /** 自定义类名 */
  className?: string
}

/**
 * 加载状态组件属性
 */
export interface LoadingStateProps {
  /** 加载文本 */
  text?: string
  /** 自定义类名 */
  className?: string
  /** 显示进度 */
  showProgress?: boolean
  /** 当前进度 */
  progress?: number
  /** 总数 */
  total?: number
}

/**
 * 错误状态组件属性
 */
export interface ErrorStateProps {
  /** 错误信息 */
  message?: string
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义类名 */
  className?: string
}
