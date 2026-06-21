import type { ComponentType, CSSProperties, ReactNode } from 'react'
import type { ComponentController, SemanticVariant } from '../../types'

export interface NotificationRef {
  hide: () => void
}

export type NotificationVariant = SemanticVariant | 'error' | 'loading'

export type NotificationPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface NotificationProps {
  className?: string
  style?: CSSProperties
  variant?: NotificationVariant
  /** 通知位置 */
  position?: NotificationPosition
  /** 通知内容，支持自定义 JSX */
  content: ReactNode
  /**
   * 自定义图标组件，渲染时会传入 `className`
   * 兼容 lucide-react 图标组件，也可传入任意接收 `className` 的组件
   */
  icon?: ComponentType<{ className?: string }>
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 自动关闭的延时，单位毫秒，设为 0 则不自动关闭 */
  duration?: number
  /** 通知关闭时的回调 */
  onClose?: () => void
  /** 通知显示时的回调 */
  onShow?: () => void
  /** 通知的 z-index */
  zIndex?: number
}

/**
 * 命令式调用 Notification 时可传入的可选项
 *
 * 在原有 position/duration/showClose 之外，透传 Notification 组件支持的其余可配置项
 * （icon/className/style/zIndex/onClose/onShow），便于命令式调用时完整定制。
 * content / variant 由调用入参与方法名决定，故此处排除。
 */
export type NotificationOptions = Omit<NotificationProps, 'content' | 'variant'>

export type NotificationType<NotificationInstanceType> = NotificationInstanceType & {
  [key in NotificationVariant]: (
    content: ReactNode,
    options?: NotificationOptions,
  ) => ComponentController
}
