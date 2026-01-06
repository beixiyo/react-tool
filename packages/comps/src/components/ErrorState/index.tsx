import { useT } from 'i18n/react'
import { RotateCcw, SatelliteDish } from 'lucide-react'
import { Button } from '../Button'

export function ErrorState(props: ErrorStateProps) {
  const { message, onRetry } = props
  const t = useT('common')

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
      <div className="bg-red-50 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center">
        <SatelliteDish size={ 28 } className="text-systemRed" />
      </div>

      <div className="text-base font-medium text-red-700 dark:text-red-300">
        { message ?? t('detail.loadingFailed') }
      </div>

      <div className="flex items-center gap-2">
        <Button variant="primary" leftIcon={ <RotateCcw size={ 16 } /> } onClick={ onRetry }>
          { t('action.retry') }
        </Button>
      </div>
    </div>
  )
}
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
  message?: string
  /**
   * 重试回调
   * @default undefined
   */
  onRetry?: () => void
}
