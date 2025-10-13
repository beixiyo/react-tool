export type DrawerPosition = 'top' | 'right' | 'bottom' | 'left'

export type DrawerProps = {
  open?: boolean
  onClose?: () => void
  position?: DrawerPosition
  overlay?: boolean
  closeButton?: boolean
  closeOnOverlayClick?: boolean
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
