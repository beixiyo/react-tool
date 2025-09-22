import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'

/**
 * 可调整大小的分割面板组件
 *
 * 提供两个面板之间的可调整分割线，支持水平和垂直方向
 * 用户可以通过拖拽分割线来调整两个面板的大小比例
 *
 * @example
 * ```tsx
 * // 第一个面板固定大小，第二个面板自动拉伸
 * <Resizable direction="horizontal" initialSize={300} minSize={100}>
 *   <div>左侧面板内容</div>
 *   <div>右侧面板内容</div>
 * </Resizable>
 *
 * // 第二个面板固定大小，第一个面板自动拉伸
 * <Resizable direction="horizontal" fixedPanel="second" initialSize={300} minSize={100}>
 *   <div>左侧面板内容</div>
 *   <div>右侧面板内容</div>
 * </Resizable>
 * ```
 */
export const Resizable = memo<ResizableProps>((props) => {
  const {
    children,
    direction = 'horizontal',
    initialSize = 200,
    minSize = 50,
    maxSize,
    onSizeChange,
    disabled = false,
    resizeHandleClassName,
    resizeHandleStyle,
    className,
    style,
    fixedPanel = 'first',
  } = props

  const [size, setSize] = useState(initialSize)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => {
      setSize(initialSize)
    },
    [initialSize],
  )

  /**
   * 处理鼠标移动事件，更新面板大小
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current || disabled)
      return

    const rect = containerRef.current.getBoundingClientRect()
    let newSize

    if (direction === 'horizontal') {
      if (fixedPanel === 'first') {
        newSize = e.clientX - rect.left
      }
      else {
        newSize = rect.right - e.clientX
      }
    }
    else {
      if (fixedPanel === 'first') {
        newSize = e.clientY - rect.top
      }
      else {
        newSize = rect.bottom - e.clientY
      }
    }

    /** 应用最小和最大尺寸限制 */
    if (typeof minSize === 'number') {
      if (newSize < minSize) {
        newSize = minSize
      }
    }
    if (typeof maxSize === 'number') {
      if (newSize > maxSize) {
        newSize = maxSize
      }
    }

    setSize(newSize)
    onSizeChange?.(newSize)
  }, [direction, minSize, maxSize, disabled, onSizeChange, fixedPanel])

  /**
   * 处理鼠标抬起事件，结束拖拽
   */
  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [handleMouseMove])

  /**
   * 处理鼠标按下事件，开始拖拽
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled)
      return

    e.preventDefault()
    isDragging.current = true
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = direction === 'horizontal'
      ? 'col-resize'
      : 'row-resize'
  }, [handleMouseMove, handleMouseUp, direction, disabled])

  /** 组件卸载时清理事件监听器 */
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  /** 验证子组件数量 */
  const panels = React.Children.toArray(children)
  if (panels.length !== 2) {
    return children
  }

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      ref={ containerRef }
      className={ cn(
        'flex w-full h-full overflow-hidden',
        isHorizontal
          ? 'flex-row'
          : 'flex-col',
        className,
      ) }
      style={ style }
    >
      {/* 第一个面板 */ }
      <div
        className={ fixedPanel === 'first'
          ? 'flex-shrink-0'
          : 'flex-grow flex-1 min-w-0 min-h-0' }
        style={ fixedPanel === 'first'
          ? {
              [isHorizontal
                ? 'width'
                : 'height']: `${size}px`,
            }
          : undefined }
      >
        { panels[0] }
      </div>

      {/* 分割线 */ }
      <div
        onMouseDown={ handleMouseDown }
        className={ cn(
          'flex-shrink-0 bg-gray-200 dark:bg-gray-700 transition-colors duration-200',
          disabled
            ? 'cursor-default opacity-50'
            : isHorizontal
              ? 'w-1 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-500'
              : 'h-1 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-500',
          resizeHandleClassName,
        ) }
        style={ resizeHandleStyle }
      />

      {/* 第二个面板 */ }
      <div
        className={ fixedPanel === 'second'
          ? 'flex-shrink-0'
          : 'flex-grow flex-1 min-w-0 min-h-0' }
        style={ fixedPanel === 'second'
          ? {
              [isHorizontal
                ? 'width'
                : 'height']: `${size}px`,
            }
          : undefined }
      >
        { panels[1] }
      </div>
    </div>
  )
})

Resizable.displayName = 'Resizable'

export type ResizableProps = {
  /**
   * 调整方向
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * 固定大小的面板
   * - 'first': 第一个面板固定大小，第二个面板自动拉伸
   * - 'second': 第二个面板固定大小，第一个面板自动拉伸
   * @default 'first'
   */
  fixedPanel?: 'first' | 'second'
  /**
   * 固定面板的初始大小（像素）
   * @default 200
   */
  initialSize?: number
  /**
   * 固定面板的最小大小（像素）
   * @default 50
   */
  minSize?: number
  /**
   * 固定面板的最大大小（像素）
   * 不设置则无限制
   */
  maxSize?: number
  /**
   * 大小变化时的回调函数
   * @param size 新的面板大小
   */
  onSizeChange?: (size: number) => void
  /**
   * 是否禁用调整大小功能
   * @default false
   */
  disabled?: boolean
  /**
   * 分割线的自定义类名
   */
  resizeHandleClassName?: string
  /**
   * 分割线的自定义样式
   */
  resizeHandleStyle?: React.CSSProperties
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
