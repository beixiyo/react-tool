import type { ButtonVariant } from 'comps'
import type { ReactNode } from 'react'

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
   * 是否正在流式输出中
   * @default false
   */
  isStreaming?: boolean
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
