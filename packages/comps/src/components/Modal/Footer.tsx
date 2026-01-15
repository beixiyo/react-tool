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
  }: ModalProps,
) {
  if (footer !== undefined)
    return footer

  return (
    <div
      className={ cn(
        `flex items-center justify-end gap-4 mt-auto`,
        footerClassName,
      ) }
      style={ footerStyle }
    >

      <Button onClick={ onClose } size="sm" loading={ cancelLoading }>
        { cancelText }
      </Button>

      <Button onClick={ onOk } variant="primary" size="sm" loading={ okLoading }>
        { okText }
      </Button>
    </div>
  )
}
