/**
 * 空内容展示组件
 * - 用于列表/画布无内容时的友好提示
 */
export type EmptyStateProps =
  & {
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
