import { cva } from 'class-variance-authority'

const sizeStyles = {
  sm: 'h-4 text-[10px]',
  md: 'h-5',
  lg: 'h-6 text-sm',
}

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900',
        secondary: 'bg-gray-500 dark:bg-gray-500 text-white',
        tip: 'bg-danger text-white',
        outline: 'border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
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