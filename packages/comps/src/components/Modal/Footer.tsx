import type { ButtonVariant } from '../Button/types'
import type { ModalProps } from './types'
import { cn } from 'utils'
import { Button } from '../Button'

export function Footer(
  {
    onClose,
    onOk,
    okText = 'OK',
    cancelText = 'Cancel',
    okLoading = false,
    cancelLoading = false,
    footer,
    footerClassName,
    footerStyle,
    variant = 'default',
    cancelButtonProps,
    okButtonProps,
  }: ModalProps,
) {
  if (footer !== undefined)
    return footer

  /** 根据 Modal variant 决定确认按钮的样式 */
  const okButtonVariantMap: Record<NonNullable<ModalProps['variant']>, ButtonVariant> = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'primary',
    default: 'primary',
  }

  const okButtonVariant = okButtonVariantMap[variant] ?? 'primary'

  return (
    <div
      className={ cn(
        `flex items-center justify-end gap-4 mt-auto`,
        footerClassName,
      ) }
      style={ footerStyle }
    >

      <Button
        onClick={ onClose }
        size="sm"
        loading={ cancelLoading }
        { ...cancelButtonProps }
      >
        { cancelText }
      </Button>

      <Button
        onClick={ onOk }
        variant={ okButtonVariant }
        size="sm"
        loading={ okLoading }
        { ...okButtonProps }
      >
        { okText }
      </Button>
    </div>
  )
}
