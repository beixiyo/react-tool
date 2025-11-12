import type { VariantProps } from 'class-variance-authority'
import type { SizeStyle } from '../../types/Component'
import { cva } from 'class-variance-authority'
import { memo } from 'react'
import { cn } from 'utils'

const sizeStyles: SizeStyle = {
  sm: 'h-4 text-[10px]',
  md: 'h-5',
  lg: 'h-6 text-sm',
}

const badgeVariants = cva(
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

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>,
  VariantProps<typeof badgeVariants> {
  /**
   * 显示的数字
   */
  count?: number
  /**
   * 是否显示为点
   */
  dot?: boolean
  /**
   * 最大显示数字
   * @default 99
   */
  maxCount?: number
  /**
   * 是否显示零
   * @default false
   */
  showZero?: boolean
  /**
   * 自定义内容
   */
  content?: React.ReactNode
}

const Badge = memo(
  ({
    className,
    variant,
    size,
    count,
    dot = false,
    maxCount = 99,
    showZero = false,
    content,
    ...props
  }: BadgeProps) => {
    const displayCount = count && count > maxCount
      ? `${maxCount}+`
      : count

    if (dot) {
      return (
        <div
          className={ cn(
            'relative inline-flex',
            className,
          ) }
          { ...props }
        >
          <div
            className={ cn(
              badgeVariants({ variant, size }),
              'absolute -right-1 -top-1 h-2 w-2 p-0',
            ) }
          />
          { props.children }
        </div>
      )
    }

    if (!count && !showZero && !content) {
      return <>{ props.children }</>
    }

    return (
      <div
        className={ cn(
          'relative inline-flex',
          className,
        ) }
        { ...props }
      >
        { props.children }
        <div
          className={ cn(
            badgeVariants({ variant, size }),
            'absolute -right-2 -top-2',
          ) }
        >
          { content || displayCount }
        </div>
      </div>
    )
  },
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
