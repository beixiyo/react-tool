import type { ReactNode } from 'react'
import type { MessageVariant } from './types'
import type { CloseBtnProps } from '../CloseBtn'
import { memo } from 'react'
import { cn } from 'utils'
import { CloseBtn } from '../CloseBtn'
import { variantStyles } from './constants'

/**
 * Message 的纯展示组件（图标 + 内容 + 关闭按钮）
 * 不含定位 / 动画 / 定时逻辑，供独立 Message 与堆叠 MessageItem 共用
 */
export const MessageView = memo<MessageViewProps>((props) => {
  const {
    variant = 'default',
    content,
    icon,
    showClose = false,
    showIcon: showIconProp,
    closeBtnProps,
    onClose,
    className,
  } = props

  const styles = variantStyles[variant]
  const Icon = icon || styles.icon
  const showIcon = showIconProp ?? !!(icon || variant === 'loading' || (variant !== 'neutral' && styles.icon))

  return (
    <div
      className={ cn(
        'flex items-start gap-3 px-4 py-3',
        'rounded-2xl shadow-toast',
        styles.bg,
        className,
      ) }
    >
      { showIcon && Icon && (
        <div className={ cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
          styles.iconBg,
          variant === 'loading' && 'animate-spin',
        ) }>
          <Icon className={ cn(
            'size-full',
            styles.accent,
            variant === 'loading' && 'size-4',
          ) } />
        </div>
      ) }

      <div className={ cn(
        'max-w-[min(72vw,360px)] wrap-break-word text-center text-sm',
        styles.accent,
      ) }>{ content }</div>

      { showClose && (
        <CloseBtn
          { ...closeBtnProps }
          mode="static"
          size={ closeBtnProps?.size ?? 20 }
          onClick={ onClose }
        />
      ) }
    </div>
  )
})

MessageView.displayName = 'MessageView'

export interface MessageViewProps {
  variant?: MessageVariant
  content: ReactNode
  icon?: (props: any) => ReactNode
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /**
   * 关闭按钮配置，mode / onClick 由 MessageView 接管
   */
  closeBtnProps?: Partial<Omit<CloseBtnProps, 'mode' | 'onClick'>>
  /** 是否显示图标；不传时按 variant 自动判定 */
  showIcon?: boolean
  /** 点击关闭按钮的回调 */
  onClose?: () => void
  className?: string
}
