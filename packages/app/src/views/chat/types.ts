import type { ReactNode } from 'react'
import type { ButtonVariant } from '@/components/Button'

export type ChatMessage = {
  /**
   * 消息ID
   */
  id: string
  /**
   * 发送者类型
   */
  sender: 'user' | 'assistant'
  /**
   * 消息类型
   */
  type: 'text' | 'markdown' | 'loading' | 'thinking-start' | 'thinking-end' | 'card'
  /**
   * 消息内容
   */
  content: string
  /**
   * 时间戳
   */
  timestamp: number
  /**
   * 图片列表
   */
  images?: {
    url: string
    caption?: string
  }[]
  /**
   * 文件列表
   */
  files?: {
    name: string
    size: number
    url: string
    type: string
  }[]
  /**
   * 卡片内容（当 type 为 'card' 时使用）
   */
  card?: {
    /**
     * 卡片标题
     */
    title?: string
    /**
     * 卡片描述
     */
    description?: string
    /**
     * 卡片内容组件
     */
    content?: ReactNode
    /**
     * 卡片操作按钮
     */
    actions?: {
      label: string
      onClick: () => void
      type?: ButtonVariant
      disabled?: boolean
    }[]
    /**
     * 卡片样式类型
     * @default 'default'
     */
    variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
    /**
     * 是否显示边框
     * @default true
     */
    bordered?: boolean
    /**
     * 卡片图标
     */
    icon?: ReactNode
  }
}

/**
 * 智能体步骤类型
 */
export type AgentStep = {
  /**
   * 步骤ID
   */
  id: string
  /**
   * 步骤类型
   */
  type: 'thinking' | 'planning' | 'executing' | 'result'
  /**
   * 步骤标题
   */
  title: string
  /**
   * 步骤内容
   */
  content: string
  /**
   * 步骤状态
   */
  status: 'pending' | 'running' | 'completed' | 'error'
  /**
   * 是否展开
   */
  expanded?: boolean
  /**
   * 子步骤
   */
  children?: AgentStep[]
}

/**
 * 智能体类型
 */
export type Agent = {
  /**
   * 智能体ID
   */
  id: string
  /**
   * 智能体名称
   */
  name: string
  /**
   * 智能体描述
   */
  description: string
  /**
   * 智能体图标
   */
  icon: string
  /**
   * 智能体步骤
   */
  steps: AgentStep[]
  /**
   * 是否激活
   */
  active: boolean
}

/**
 * 报告内容项类型
 */
export type ReportContentItem = {
  /**
   * 内容ID
   */
  id: string
  /**
   * 内容类型
   */
  type: 'text' | 'markdown' | 'image' | 'video' | 'file' | 'code'
  /**
   * 内容标题
   */
  title?: string
  /**
   * 内容数据
   */
  content: string
  /**
   * 额外属性
   */
  metadata?: {
    /**
     * 文件大小（字节）
     */
    size?: number
    /**
     * 文件类型
     */
    mimeType?: string
    /**
     * 图片/视频尺寸
     */
    dimensions?: {
      width: number
      height: number
    }
    /**
     * 视频时长（秒）
     */
    duration?: number
    /**
     * 缩略图URL
     */
    thumbnail?: string
    /**
     * 描述信息
     */
    description?: string
    /**
     * 代码语言（当type为code时使用）
     */
    language?: string
    /**
     * 代码预览配置（当type为code时使用）
     */
    codePreview?: {
      /**
       * 是否可拖拽
       * @default true
       */
      draggable?: boolean
      /**
       * 是否显示控制栏
       * @default true
       */
      showControls?: boolean
      /**
       * 内容溢出时的滚动行为
       * @default 'auto'
       */
      overflow?: 'hidden' | 'auto' | 'scroll' | 'visible'
      /**
       * 初始位置
       */
      initialPosition?: {
        x?: number
        y?: number
      }
    }
  }
}

/**
 * 报告数据类型
 */
export type ReportData = {
  /**
   * 报告ID
   */
  id: string
  /**
   * 报告标题
   */
  title: string
  /**
   * 报告描述
   */
  description?: string
  /**
   * 创建时间
   */
  createdAt: number
  /**
   * 更新时间
   */
  updatedAt: number
  /**
   * 报告内容项列表
   */
  items: ReportContentItem[]
  /**
   * 报告标签
   */
  tags?: string[]
}

/**
 * 智能体任务状态类型
 */
export type TaskStatus = 'complete' | 'in-progress' | 'waiting' | 'error' | 'cancelled'

/**
 * 任务操作按钮类型
 */
export type TaskAction = {
  /**
   * 操作标识
   */
  key: string
  /**
   * 按钮文本
   */
  label: string
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
}

/**
 * 智能体任务类型
 */
export type AgentTask = {
  /**
   * 唯一标识
   */
  id: string
  /**
   * 任务标题
   */
  title: string
  /**
   * 任务状态
   */
  status: TaskStatus
  /**
   * 任务描述
   */
  description?: string
  /**
   * 头像图标
   */
  avatar?: string
  /**
   * 操作按钮
   */
  actions?: TaskAction[]
  /**
   * 进度百分比（0-100）
   */
  progress?: number
  /**
   * 额外数据
   */
  meta?: Record<string, any>
  /**
   * 是否可收起展开
   * @default true
   */
  collapsible?: boolean
  /**
   * 默认是否收起
   * @default false
   */
  defaultCollapsed?: boolean
}
