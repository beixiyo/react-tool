import type { CSSProperties, ReactNode } from 'react'
import type { ComponentController } from '../../types'

export interface NotificationRef {
  hide: () => void
}

export type NotificationVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'loading'

export type NotificationPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface NotificationProps {
  className?: string
  style?: CSSProperties
  variant?: NotificationVariant
  /** 通知位置 */
  position?: NotificationPosition
  /** 通知内容，支持自定义 JSX */
  content: ReactNode
  icon?: (props: any) => ReactNode
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

export type NotificationType<NotificationInstanceType> = NotificationInstanceType & {
  [key in NotificationVariant]: (
    content: ReactNode,
    options?: {
      position?: NotificationPosition
      duration?: number
      showClose?: boolean
    },
  ) => ComponentController
}
