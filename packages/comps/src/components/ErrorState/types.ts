/**
 * 错误状态展示组件
 * - 可显示错误信息并提供重试按钮
 */
export type ErrorStateProps =
  & {
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
