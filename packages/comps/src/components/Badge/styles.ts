import { cva } from 'class-variance-authority'
import type { SizeStyle } from '../../types/Component'

const sizeStyles: SizeStyle = {
  sm: 'h-4 text-[10px]',
  md: 'h-5',
  lg: 'h-6 text-sm',
}

/**
 * 徽章样式变体；`promo` 用于营销/促销胶囊（浅底 + 品牌蓝字）
 */
export const badgeVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-button text-button3',
        secondary: 'bg-gray-500 text-white',
        outline: 'border border-border bg-background text-text',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        error: 'bg-danger text-white',
        info: 'bg-info text-white',
      },
      size: {
        sm: sizeStyles.sm,
        md: sizeStyles.md,
        lg: sizeStyles.lg,
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)
