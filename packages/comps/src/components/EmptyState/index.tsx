import { useT } from 'i18n/react'
import { cn } from 'utils'
import { EmptyIcon } from '../../icons/EmptyIcon'
import { Button } from '../Button'

export function EmptyState(props: EmptyStateProps) {
  const {
    title,
    description,
    actionLabel,
    onAction,
    className,
    ...rest
  } = props
  const t = useT('common')

  return (
    <div
      className={ cn('h-full flex flex-col items-center justify-center gap-3 text-center px-6', className) }
      { ...rest }
    >
      <div className="bg-muted/60 dark:bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center">
        <EmptyIcon size={ 64 } className="text-secondary" />
      </div>

      <div className="text-lg font-medium text-foreground">
        { title ?? t('empty.title') }
      </div>
      <div className="text-sm text-muted">
        { description ?? t('empty.description') }
      </div>

      { actionLabel && (
        <div>
          <Button variant="primary" onClick={ onAction }>
            { actionLabel }
          </Button>
        </div>
      ) }
    </div>
  )
}
EmptyState.displayName = 'EmptyState'

/**
 * 空内容展示组件
 * - 用于列表/画布无内容时的友好提示
 */
export type EmptyStateProps = {
  /**
   * 标题文本
   * @default undefined
   */
  title?: string
  /**
   * 说明文本
   * @default undefined
   */
  description?: string
  /**
   * 可选操作按钮文本
   * @default undefined
   */
  actionLabel?: string
  /**
   * 操作回调
   * @default undefined
   */
  onAction?: () => void
}
& React.HTMLAttributes<HTMLDivElement>
