import type { CSSProperties, ReactNode } from 'react'
import type { ComponentController, SemanticVariant } from '../../types'

export interface MessageRef {
  hide: () => void
}

export type MessageVariant = SemanticVariant | 'error' | 'loading' | 'neutral'

export interface MessageProps {
  className?: string
  style?: CSSProperties
  variant?: MessageVariant

  /** 消息内容 */
  content: ReactNode
  icon?: (props: any) => ReactNode
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /**
   * 是否显示图标；不传时按 variant 自动判定（neutral 无图标，其余按语义带图标）
   */
  showIcon?: boolean
  /** 自动关闭的延时，单位毫秒，设为 0 则不自动关闭 */
  duration?: number
  /** 消息关闭时的回调 */
  onClose?: () => void
  /** 消息显示时的回调 */
  onShow?: () => void
  /** 消息的 z-index */
  zIndex?: number
}

/**
 * 堆叠仓库中单条消息的数据
 * 由命令式调用（Message.success 等）生成，供 MessageContainer 渲染
 */
export interface MessageItemData {
  /** 仓库自增的唯一标识 */
  id: number
  variant: MessageVariant
  content: ReactNode
  icon?: (props: any) => ReactNode
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /** 是否显示图标；不传时按 variant 自动判定 */
  showIcon?: boolean
  /** 自动关闭的延时，单位毫秒，设为 0 则不自动关闭 */
  duration: number
  className?: string
  style?: CSSProperties
  /** 消息的 z-index */
  zIndex?: number
  /** 消息显示时的回调 */
  onShow?: () => void
  /** 消息关闭时的回调 */
  onClose?: () => void
}

/**
 * 原地更新命令式消息；未传字段保持不变，每次更新重新计算自动关闭时间
 * duration 未传时沿用当前值，包括 loading 的 0（不自动关闭）
 * 不重新触发 onShow，已关闭的消息不会被重新创建
 */
export type MessageUpdateOptions = Partial<Omit<MessageProps, 'onShow'>>

/** 命令式消息控制器，兼容原有 close 调用 */
export interface MessageController extends ComponentController {
  /**
   * 保留消息身份和堆叠位置，更新内容、变体或显示配置
   * @example
   * const toast = Message.loading('Switching…')
   * toast.update({ variant: 'neutral', content: 'Switched.', duration: 5000 })
   */
  update: (options: MessageUpdateOptions) => void
}

/** Message 组件及其命令式调用入口 */
export type MessageType<MessageInstanceType> =
  & MessageInstanceType
  & {
    [key in MessageVariant]: (
      contentOrProps: ReactNode | Partial<MessageProps>,
      duration?: number,
    ) => MessageController
  }
