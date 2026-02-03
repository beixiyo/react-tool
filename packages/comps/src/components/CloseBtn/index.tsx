import { X } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { cn } from 'utils'

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
    corner = 'top-right',
    stopPropagation = true,
    strokeWidth = 2,
    children,
    onClick,
    ...rest
  } = props

  const sizeConfig = {
    sm: { container: 'size-2', icon: iconSize ?? 12 },
    md: { container: 'size-4', icon: iconSize ?? 16 },
    lg: { container: 'size-6', icon: iconSize ?? 20 },
    xl: { container: 'size-8', icon: iconSize ?? 24 },
  }

  const currentSize = sizeConfig[size]

  const positionClass = useMemo(() => {
    if (mode === 'static')
      return ''
    const posBase = mode === 'fixed'
      ? 'fixed'
      : 'absolute'
    const cornerClass = corner === 'top-right'
      ? 'top-2 right-2'
      : corner === 'top-left'
        ? 'top-2 left-2'
        : corner === 'bottom-right'
          ? 'bottom-2 right-2'
          : 'bottom-2 left-2'
    return cn(posBase, cornerClass)
  }, [mode, corner])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation)
      e.stopPropagation()
    onClick?.(e)
  }, [onClick, stopPropagation])

  return (
    <button
      type="button"
      aria-label="关闭"
      onClick={ handleClick }
      className={ cn(
        'CloseBtn z-50 inline-flex items-center justify-center rounded-full',
        currentSize.container,
        positionClass,
        className,
      ) }
      style={ style }
      { ...rest }
    >
      <span className="transition-transform duration-200 hover:text-danger">
        { children ?? (
          <X size={ currentSize.icon } strokeWidth={ strokeWidth } />
        ) }
      </span>
    </button>
  )
})

CloseBtn.displayName = 'CloseBtn'

export type CloseBtnProps = {
  /**
   * 按钮尺寸
   * @default 'sm'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
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
