import type { NotificationPosition } from './types'
import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'

export const DURATION = 2000

export const variantStyles = {
  default: {
    accent: 'text-text',
    bg: 'bg-background2',
    icon: Info,
    iconBg: 'bg-background3',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-background2',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-background2',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  danger: {
    accent: 'text-danger',
    bg: 'bg-background2',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-background2',
    icon: Info,
    iconBg: 'bg-infoBg',
  },
  loading: {
    accent: 'text-text',
    bg: 'bg-background2',
    icon: Loader2,
    iconBg: 'bg-background3',
  },
} as const

/** 位置对应的样式类 */
export const positionStyles: Record<NotificationPosition, { container: string, initial: any, animate: any }> = {
  topLeft: {
    container: 'top-4 left-4',
    initial: { opacity: 0, x: -20, y: -20 },
    animate: { opacity: 1, x: 0, y: 0 },
  },
  topRight: {
    container: 'top-4 right-4',
    initial: { opacity: 0, x: 20, y: -20 },
    animate: { opacity: 1, x: 0, y: 0 },
  },
  bottomLeft: {
    container: 'bottom-4 left-4',
    initial: { opacity: 0, x: -20, y: 20 },
    animate: { opacity: 1, x: 0, y: 0 },
  },
  bottomRight: {
    container: 'bottom-4 right-4',
    initial: { opacity: 0, x: 20, y: 20 },
    animate: { opacity: 1, x: 0, y: 0 },
  },
}
