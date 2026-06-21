import type { Size } from '../../types'
import { Maximize2, Minus, X } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { getSizeStyles } from '../../utils/sizeUtils'

type ButtonId = 'close' | 'minimize' | 'maximize'

type ButtonMeta = {
  color: string
  hoverColor: string
  iconColor: string
  icon: typeof X
}

const BUTTON_META: Record<ButtonId, ButtonMeta> = {
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

const DEFAULT_LABELS: Record<ButtonId, string> = {
  close: 'Close',
  minimize: 'Minimize',
  maximize: 'Maximize',
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
  if (typeof size === 'number')
    return Math.round(size * ICON_RATIO)
  return { sm: 8, md: 9, lg: 10 }[size]
}

function getGap(size: Size): string {
  if (typeof size === 'number') {
    return size >= 16
      ? 'gap-2.5'
      : 'gap-2'
  }
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
  buttonMeta,
  labels,
  ...rest
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
      { ...rest }
      className={ cn('flex items-center', getGap(size), className) }
      style={ style }
      onMouseEnter={ () => setHovered(true) }
      onMouseLeave={ () => setHovered(false) }
    >
      {order.map((id) => {
        const meta = { ...BUTTON_META[id], ...buttonMeta?.[id] }
        const Icon = meta.icon

        return (
          <button
            key={ id }
            type="button"
            aria-label={ labels?.[id] ?? DEFAULT_LABELS[id] }
            onClick={ handlers[id] }
            className={ cn(
              'rounded-full flex items-center justify-center transition-colors',
              dotSize.className,
              meta.color,
              meta.hoverColor,
              dotClassName,
            ) }
            style={ dotSize.style }
          >
            {hovered && (
              <Icon
                size={ iconPx }
                className={ meta.iconColor }
                strokeWidth={ 3 }
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
  /**
   * 按钮级元数据覆盖（颜色 / hover 颜色 / 图标颜色 / 图标），按 id 部分覆盖默认值
   * @default undefined
   */
  buttonMeta?: Partial<Record<ButtonId, Partial<ButtonMeta>>>
  /**
   * 各按钮的无障碍标签（aria-label），便于 i18n
   * @default { close: 'Close', minimize: 'Minimize', maximize: 'Maximize' }
   */
  labels?: Partial<Record<ButtonId, string>>
} & React.HTMLAttributes<HTMLElement>
