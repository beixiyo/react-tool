import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { ModalVariant } from './types'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export const DURATION = 0.3

export const variantStyles: Record<ModalVariant, {
  accent: string
  bg: string
  border: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  iconBg: string
}> = {
  default: {
    accent: 'text-textSecondary',
    bg: 'bg-background text-textPrimary',
    border: 'border-border',
    icon: Info,
    iconBg: 'bg-backgroundSecondary',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-background text-textPrimary',
    border: 'border-border',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-background text-textPrimary',
    border: 'border-border',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  error: {
    accent: 'text-danger',
    bg: 'bg-background text-textPrimary',
    border: 'border-border',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-background text-textPrimary',
    border: 'border-border',
    icon: Info,
    iconBg: 'bg-infoBg',
  },
} as const
