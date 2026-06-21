export type DrawerPosition = 'top' | 'right' | 'bottom' | 'left'

export type DrawerProps = {
  open?: boolean
  onClose?: () => void
  position?: DrawerPosition
  overlay?: boolean
  closeButton?: boolean
  closeOnOverlayClick?: boolean
  /**
   * 自定义关闭按钮图标，仅在 closeButton 为 true 时生效（DrawerFramer 使用内置 CloseBtn，不支持此项）
   */
  closeIcon?: React.ReactNode
  /**
   * 关闭按钮的可访问标签（aria-label 与 sr-only 文案），便于 i18n
   * @default 'Close drawer'
   */
  closeButtonLabel?: string
  /**
   * 抽屉的可访问名称，映射到容器的 aria-label（用于读屏）
   */
  ariaLabel?: string
  /**
   * 关联标题元素 id，映射到容器的 aria-labelledby
   */
  ariaLabelledby?: string
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
