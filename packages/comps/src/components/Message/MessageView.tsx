import type { ReactNode } from 'react'
import type { MessageVariant } from './types'
import { X } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
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
    onClose,
    className,
  } = props

  const styles = variantStyles[variant]
  const Icon = icon || styles.icon
  const showIcon = showIconProp ?? !!(icon || variant === 'loading' || (variant !== 'neutral' && styles.icon))

  return (
    <div
      className={ cn(
        'flex items-center gap-3 px-4 py-3',
        'rounded-2xl shadow-toast',
        styles.bg,
        className,
      ) }
    >
      { showIcon && Icon && (
        <div className={ cn(
          'flex size-5 items-center justify-center rounded-full',
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

      <div className={ cn('text-sm', styles.accent) }>{ content }</div>

      { showClose && (
        <button
          onClick={ onClose }
          className={ cn(
            'ml-2 flex h-5 w-5 items-center justify-center rounded-full',
            'hover:bg-slate-100 dark:hover:bg-slate-700',
            'transition-colors',
          ) }
        >
          <X className="h-3 w-3 text-slate-400" />
        </button>
      ) }
    </div>
  )
})

MessageView.displayName = 'MessageView'

export interface MessageViewProps {
  variant?: MessageVariant
  content: ReactNode
  icon?: (props: any) => ReactNode
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示图标；不传时按 variant 自动判定 */
  showIcon?: boolean
  /** 点击关闭按钮的回调 */
  onClose?: () => void
  className?: string
}
