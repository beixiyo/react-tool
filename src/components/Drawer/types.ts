export type Position = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerProps {
  className?: string
  children: React.ReactNode
  open?: boolean
  onClose?: () => void
  position?: Position
  overlay?: boolean
  closeButton?: boolean
  closeOnOverlayClick?: boolean
}
