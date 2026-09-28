import { cn } from 'utils'
import { useT } from '../../i18n'
import { EmptyIcon } from '../../icons/EmptyIcon'
import { Button } from '../Button'
import type { EmptyStateProps } from './types'

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
