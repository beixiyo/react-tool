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
    accent: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-600',
    icon: Info,
    iconBg: 'bg-slate-100 dark:bg-slate-700',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-success/50',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-warning/50',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  error: {
    accent: 'text-danger',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-danger/50',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-info/50',
    icon: Info,
    iconBg: 'bg-infoBg',
  },
} as const
