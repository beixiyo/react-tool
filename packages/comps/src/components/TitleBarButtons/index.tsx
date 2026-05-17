import { memo, useState } from 'react'
import { cn } from 'utils'
import { Minus, X, Maximize2 } from 'lucide-react'
import { getSizeStyles } from '../../utils/sizeUtils'
import type { Size } from '../../types'

type ButtonId = 'close' | 'minimize' | 'maximize'

const BUTTON_META: Record<ButtonId, {
  color: string
  hoverColor: string
  iconColor: string
  icon: typeof X
}> = {
  close: {
    color: 'bg-red-400',
    hoverColor: 'hover:bg-red-500',
    iconColor: 'text-red-900',
    icon: X,
  },
  minimize: {
    color: 'bg-yellow-400',
    hoverColor: 'hover:bg-yellow-500',
    iconColor: 'text-yellow-900',
    icon: Minus,
  },
  maximize: {
    color: 'bg-green-400',
    hoverColor: 'hover:bg-green-500',
    iconColor: 'text-green-900',
    icon: Maximize2,
  },
}

const DOT_SIZE_CONFIG = {
  classes: {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  },
  getInlineStyle: (s: number) => ({
    width: s,
    height: s,
  }),
}

const ICON_RATIO = 0.6

function getIconSize(size: Size): number {
  if (typeof size === 'number') return Math.round(size * ICON_RATIO)
  return { sm: 8, md: 9, lg: 10 }[size]
}

function getGap(size: Size): string {
  if (typeof size === 'number') return size >= 16 ? 'gap-2.5' : 'gap-2'
  return { sm: 'gap-2', md: 'gap-2', lg: 'gap-2.5' }[size]
}

/**
 * macOS-style traffic light buttons with hover icons
 */
export const TitleBarButtons = memo<TitleBarButtonsProps>(({
  style,
  className,
  dotClassName,
  size = 'md',
  order = ['close', 'minimize', 'maximize'],
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [hovered, setHovered] = useState(false)

  const dotSize = getSizeStyles(size, DOT_SIZE_CONFIG)
  const iconPx = getIconSize(size)

  const handlers: Record<ButtonId, (() => void) | undefined> = {
    close: onClose,
    minimize: onMinimize,
    maximize: onMaximize,
  }

  return (
    <div
      className={cn('flex items-center', getGap(size), className)}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {order.map(id => {
        const meta = BUTTON_META[id]
        const Icon = meta.icon

        return (
          <button
            key={id}
            type="button"
            onClick={handlers[id]}
            className={cn(
              'rounded-full flex items-center justify-center transition-colors',
              dotSize.className,
              meta.color,
              meta.hoverColor,
              dotClassName,
            )}
            style={dotSize.style}
          >
            {hovered && (
              <Icon
                size={iconPx}
                className={meta.iconColor}
                strokeWidth={3}
              />
            )}
          </button>
        )
      })}
    </div>
  )
})

TitleBarButtons.displayName = 'TitleBarButtons'

export type TitleBarButtonsProps = {
  /**
   * 圆点尺寸
   * @default 'md'
   */
  size?: Size
  /**
   * 按钮排列顺序
   * @default ['close', 'minimize', 'maximize']
   */
  order?: ButtonId[]
  /** 自定义圆点类名 */
  dotClassName?: string
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
} & React.HTMLAttributes<HTMLElement>
