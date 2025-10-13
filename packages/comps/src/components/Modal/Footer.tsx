import type { ModalProps } from './types'
import { cn } from 'utils'
import { Button } from '../Button'

export function Footer(
  {
    onClose,
    onOk,
    okText = 'OK',
    cancelText = 'Cancel',
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

      <Button onClick={ onClose } size="sm">
        { cancelText }
      </Button>

      <Button onClick={ onOk } variant="primary" size="sm">
        { okText }
      </Button>
    </div>
  )
}
