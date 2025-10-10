export type DrawerPosition = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerProps {
  className?: string
  children: React.ReactNode
  open?: boolean
  onClose?: () => void
  position?: DrawerPosition
  overlay?: boolean
  closeButton?: boolean
  closeOnOverlayClick?: boolean
}
