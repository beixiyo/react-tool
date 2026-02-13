import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'

export const DURATION = 2000

export const variantStyles = {
  default: {
    accent: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: Info,
    iconBg: 'bg-slate-100 dark:bg-slate-700',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-white dark:bg-slate-800',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-white dark:bg-slate-800',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  danger: {
    accent: 'text-danger',
    bg: 'bg-white dark:bg-slate-800',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-white dark:bg-slate-800',
    icon: Info,
    iconBg: 'bg-infoBg',
  },
  loading: {
    accent: 'text-background',
    bg: 'bg-text/80',
    icon: Loader2,
    iconBg: '',
  },
  neutral: {
    accent: 'text-background',
    bg: 'bg-text/80',
    icon: Loader2,
    iconBg: '',
  },
} as const
