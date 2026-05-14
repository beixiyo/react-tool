import type { Optional } from '@jl-org/ts-tool'
import type { ReactNode } from 'react'

/**
 * 信息流卡片数据项
 */
export type FeedItem = {
  /** 唯一标识 */
  id: number | string
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 时间戳 */
  timestamp: string
  /** 作者 */
  author: string
  /** 主题色 */
  color: string
}

/**
 * 卡片渲染配置
 */
export type CardRenderConfig = {
  /** 卡片样式自定义类名 */
  className?: string
  /** 卡片悬停缩放比例 */
  hoverScale?: number
  /** 卡片点击缩放比例 */
  tapScale?: number
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否显示时间戳 */
  showTimestamp?: boolean
  /** 内容最大行数 */
  contentMaxLines?: number
}

/**
 * 动画配置
 */
export type AnimationConfig = {
  /** 入场动画初始 Y 偏移 */
  initialY?: number
  /** 入场动画初始缩放 */
  initialScale?: number
  /** 入场动画 X 轴旋转角度 */
  initialRotateX?: number
  /** 退出动画 Y 偏移 */
  exitY?: number
  /** 退出动画缩放 */
  exitScale?: number
  /** 动画弹簧刚度 */
  stiffness?: number
  /** 动画弹簧阻尼 */
  damping?: number
  /** 动画质量 */
  mass?: number
  /** 退出动画时长 */
  exitDuration?: number
}

/**
 * 详情弹窗配置
 */
export type DetailModalConfig = {
  /** 是否启用详情弹窗 */
  enabled?: boolean
  /** 弹窗背景类名 */
  backdropClassName?: string
  /** 弹窗内容类名 */
  contentClassName?: string
  /** 弹窗初始缩放 */
  initialScale?: number
  /** 弹窗 Y 轴旋转角度 */
  initialRotateY?: number
}

/**
 * 设置面板配置
 */
export type SettingsPanelConfig = {
  /** 是否启用设置面板 */
  enabled?: boolean
  /** 面板位置 */
  position?: 'left' | 'right'
  /** 最大宽度 */
  maxWidth?: string
  /** 是否显示速度控制 */
  showSpeedControl?: boolean
  /** 速度范围 */
  speedRange?: {
    min: number
    max: number
    step: number
  }
  /** 是否显示添加内容表单 */
  showAddContent?: boolean
}

/**
 * InfiniteFeed 组件属性
 */
export type InfiniteFeedProps = {
  /** 初始数据列表 */
  initialItems?: FeedItem[]
  /** 自动生成新数据的间隔（秒），为 0 则不自动生成 */
  autoGenerateInterval?: number
  /** 数据生成器函数 */
  generateItem?: (id: number) => FeedItem
  /**
   * 最大显示数量（视觉层控制）
   *
   * 控制可见卡片的数量，超出此数量的卡片会被设置为透明（opacity: 0）但仍存在于 DOM 中
   *
   * **工作原理**：
   * - 通过控制卡片的 `opacity` 属性实现
   * - index >= maxDisplayCount 的卡片会被隐藏
   * - 不影响数据数组的实际长度
   *
   * **使用场景**：
   * - 控制用户能看到的卡片数量
   * - 保持界面整洁，避免信息过载
   *
   * @default 10
   */
  maxDisplayCount?: number
  /**
   * 最大保留数量（数据层控制）
   *
   * 控制内存中保留的数据数量，超出此数量的旧数据会被自动删除并触发退出动画
   *
   * **工作原理**：
   * - 使用 `Array.slice(-maxRetainCount)` 只保留最新的 N 条数据
   * - 每次添加新数据时自动裁剪数组
   * - 被移除的数据会触发 motion 的退出动画后才从 DOM 删除
   *
   * **性能优化**：
   * - 防止数据无限增长导致内存泄漏
   * - 限制 DOM 节点数量，保持渲染性能
   * - 配合 AnimatePresence 实现流畅的退出效果
   *
   * **建议值**：
   * - 应该 >= maxDisplayCount（通常设置为 maxDisplayCount + 5）
   * - 给退出动画留出缓冲空间
   *
   * @default 15
   */
  maxRetainCount?: number
  /** 卡片点击回调 */
  onCardClick?: (item: FeedItem) => void
  /** 卡片渲染配置 */
  cardRenderConfig?: CardRenderConfig
  /** 动画配置 */
  animationConfig?: AnimationConfig
  /** 详情弹窗配置 */
  detailModalConfig?: DetailModalConfig
  /** 设置面板配置 */
  settingsPanelConfig?: SettingsPanelConfig
  /** 自定义卡片渲染器 */
  renderCard?: (item: FeedItem, index: number) => ReactNode
  /** 自定义详情内容渲染器 */
  renderDetail?: (item: FeedItem) => ReactNode
  /** 背景类名 */
  backgroundClassName?: string
  /** 容器类名 */
  containerClassName?: string
  /** 是否显示设置按钮 */
  showSettingsButton?: boolean
  /** 暂停状态（受控） */
  paused?: boolean
  /** 暂停状态变化回调 */
  onPausedChange?: (paused: boolean) => void
  /** 速度（受控） */
  speed?: number
  /** 速度变化回调 */
  onSpeedChange?: (speed: number) => void
}

/**
 * FeedCard 组件属性
 */
export type FeedCardProps = {
  /** 卡片数据 */
  item: FeedItem
  /** 索引 */
  index: number
  /** 点击回调 */
  onClick?: (item: FeedItem) => void
  /** 渲染配置 */
  config?: CardRenderConfig
  /** 动画配置 */
  animationConfig?: AnimationConfig
  /** 自定义渲染器 */
  render?: (item: FeedItem, index: number) => ReactNode
  /** 最大可见数量 */
  maxDisplayCount?: number
}

/**
 * FeedDetailModal 组件属性
 */
export type FeedDetailModalProps = {
  /** 选中的数据项 */
  item: FeedItem | null
  /** 是否显示 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 配置 */
  config?: DetailModalConfig
  /** 自定义渲染器 */
  render?: (item: FeedItem) => ReactNode
}

/**
 * FeedSettingsPanel 组件属性
 */
export type FeedSettingsPanelProps = {
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 速度值 */
  speed: number
  /** 速度变化回调 */
  onSpeedChange: (speed: number) => void
  /** 添加内容回调 */
  onAddContent?: (item: Optional<
    Omit<FeedItem, 'id' | 'timestamp'>,
    'color'
  >) => void
  /** 配置 */
  config?: SettingsPanelConfig
}
