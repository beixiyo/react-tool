import { RotateCcw, SatelliteDish } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'

function InnerErrorState(props: ErrorStateProps) {
  const {
    message,
    onRetry,
    retryLabel,
    icon,
    loading = false,
    className,
    ...rest
  } = props
  const t = useT('common')

  return (
    <div
      className={ cn('h-full flex flex-col items-center justify-center gap-4 px-6', className) }
      { ...rest }
    >
      <div className="bg-red-50 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center">
        { icon ?? <SatelliteDish size={ 28 } className="text-systemRed" /> }
      </div>

      <div className="text-base font-medium text-red-700 dark:text-red-300">
        { message ?? t('detail.loadingFailed') }
      </div>

      { onRetry && (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            leftIcon={ <RotateCcw size={ 16 } /> }
            loading={ loading }
            onClick={ onRetry }
          >
            { retryLabel ?? t('action.retry') }
          </Button>
        </div>
      ) }
    </div>
  )
}

export const ErrorState = memo(InnerErrorState)
ErrorState.displayName = 'ErrorState'

/**
 * 错误状态展示组件
 * - 可显示错误信息并提供重试按钮
 */
export type ErrorStateProps = {
  /**
   * 错误提示文案
   * @default undefined
   */
  message?: React.ReactNode
  /**
   * 重试回调，未传时不渲染重试按钮
   * @default undefined
   */
  onRetry?: () => void
  /**
   * 重试按钮文案
   * @default t('action.retry')
   */
  retryLabel?: React.ReactNode
  /**
   * 自定义状态图标
   * @default <SatelliteDish />
   */
  icon?: React.ReactNode
  /**
   * 重试中状态，会禁用并显示按钮 loading
   * @default false
   */
  loading?: boolean
}
& React.HTMLAttributes<HTMLDivElement>
