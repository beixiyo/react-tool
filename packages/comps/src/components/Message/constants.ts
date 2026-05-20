import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'

export const DURATION = 2000

export const variantStyles = {
  default: {
    accent: 'text-text2',
    bg: 'bg-background text-text',
    icon: Info,
    iconBg: 'bg-background2',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-background text-text',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-background text-text',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  danger: {
    accent: 'text-danger',
    bg: 'bg-background text-text',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  error: {
    accent: 'text-danger',
    bg: 'bg-background text-text',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-background text-text',
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
