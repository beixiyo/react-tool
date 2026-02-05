import { X } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { cn } from 'utils'

const PRESET_SIZES = ['sm', 'md', 'lg', 'xl'] as const
type PresetSize = (typeof PRESET_SIZES)[number]

/** default 模式：仅容器尺寸，无内边距 */
const sizeConfig: Record<PresetSize, { container: string, icon: number }> = {
  sm: { container: 'size-2', icon: 12 },
  md: { container: 'size-4', icon: 16 },
  lg: { container: 'size-6', icon: 20 },
  xl: { container: 'size-8', icon: 24 },
}

/** filled 模式：容器更大并带至少 2px padding，避免图标贴边且 sm 不会过小 */
const sizeConfigFilled: Record<PresetSize, { container: string, icon: number }> = {
  sm: { container: 'size-4 p-0.5', icon: 12 },
  md: { container: 'size-6 p-0.5', icon: 16 },
  lg: { container: 'size-8 p-0.5', icon: 20 },
  xl: { container: 'size-10 p-0.5', icon: 24 },
}

/**
 * 通用关闭按钮组件
 * - 支持 absolute / fixed / static 三种定位模式
 * - 非 static 模式下默认吸附到右上角，可通过 corner 定制
 * - 如需自定义偏移量，通过 className 传入 Tailwind 类名（如 top-4 right-4 或 top-[13px]）
 */
export const CloseBtn = memo<CloseBtnProps>((props) => {
  const {
    style,
    className,
    size = props.mode === 'absolute'
      ? 'sm'
      : 'md',
    iconSize,
    mode = 'absolute',
    variant = 'default',
    corner = 'top-right',
    stopPropagation = true,
    strokeWidth = 2,
    children,
    onClick,
    ...rest
  } = props

  const isNumericSize = typeof size === 'number'
  const presetSize = isNumericSize
    ? undefined
    : size
  const config = variant === 'filled'
    ? sizeConfigFilled
    : sizeConfig
  const currentSize = presetSize
    ? config[presetSize]
    : null

  const containerClass = currentSize
    ? currentSize.container
    : ''
  const resolvedIconSize = iconSize ?? (currentSize
    ? currentSize.icon
    : isNumericSize
      ? size * 0.75
      : 16)
  const sizeStyle = isNumericSize
    ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }
    : undefined

  const positionClass = useMemo(() => {
    if (mode === 'static')
      return ''

    let cornerClass = ''
    if (mode === 'absolute') {
      cornerClass = corner === 'top-right'
        ? 'top-2 right-2'
        : corner === 'top-left'
          ? 'top-2 left-2'
          : corner === 'bottom-right'
            ? 'bottom-2 right-2'
            : 'bottom-2 left-2'
    }
    else {
      cornerClass = corner === 'top-right'
        ? 'top-4 right-4'
        : corner === 'top-left'
          ? 'top-4 left-4'
          : corner === 'bottom-right'
            ? 'bottom-4 right-4'
            : 'bottom-4 left-4'
    }
    return cn(mode, cornerClass)
  }, [mode, corner])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation)
      e.stopPropagation()
    onClick?.(e)
  }, [onClick, stopPropagation])

  const variantClass = variant === 'filled'
    ? 'bg-buttonPrimary text-background'
    : 'text-textPrimary'
  const filledNumericPadding = variant === 'filled' && isNumericSize
    ? 'p-0.5'
    : ''

  return (
    <button
      type="button"
      aria-label="关闭"
      onClick={ handleClick }
      className={ cn(
        'z-50 inline-flex items-center justify-center rounded-full transition-all duration-300 hover:opacity-60',
        variantClass,
        containerClass,
        filledNumericPadding,
        positionClass,
        className,
      ) }
      style={ sizeStyle
        ? { ...sizeStyle, ...style }
        : style }
      { ...rest }
    >
      { children ?? (
        <X size={ resolvedIconSize } strokeWidth={ strokeWidth } />
      ) }
    </button>
  )
})

CloseBtn.displayName = 'CloseBtn'

export type CloseBtnProps = {
  /**
   * 按钮尺寸，支持预设或数字（像素），与 Button 一致
   * @default 'sm'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  /**
   * Icon 尺寸，会覆盖 size 的默认图标尺寸
   */
  iconSize?: number
  /**
   * @default 1.5
   */
  strokeWidth?: number
  /**
   * 按钮定位模式
   * @default 'absolute'
   */
  mode?: 'absolute' | 'fixed' | 'static'
  /**
   * 视觉变体：default 无背景，filled 使用 buttonPrimary 背景色
   * @default 'default'
   */
  variant?: 'default' | 'filled'
  /**
   * 定位角落，仅在非 static 模式下生效
   * @default 'top-right'
   */
  corner?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /**
   * 是否阻止事件冒泡
   * @default true
   */
  stopPropagation?: boolean
}
& React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
