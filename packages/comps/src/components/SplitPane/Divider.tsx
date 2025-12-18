import type { DividerProps } from './types'
import { memo, useCallback, useState } from 'react'
import { cn } from 'utils'
import { CollapseButton } from './CollapseButton'
import { useDrag } from './hooks/useDrag'

/**
 * 分隔条组件
 */
export const Divider = memo(({
  index,
  size,
  leftCollapsible,
  rightCollapsible,
  leftCollapsed,
  rightCollapsed,
  onDragStart,
  onCollapseLeft,
  onCollapseRight,
  theme,
  styleConfig,
  draggable = true,
}: DividerProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleDragStart = useCallback(
    (event: React.MouseEvent) => {
      onDragStart(index, event)
    },
    [index, onDragStart],
  )

  const { handleMouseDown } = useDrag({
    onDragStart: handleDragStart,
    onDrag: () => { }, // 实际拖拽逻辑由父组件处理
    onDragEnd: () => { },
  })

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const canDrag = draggable

  /** 获取分隔条背景色（优先使用 styleConfig，否则使用 theme） */
  const getBackgroundColor = () => {
    if (isHovered) {
      return styleConfig?.hoverStyle?.backgroundColor ?? theme?.dividerHoverColor ?? 'rgb(var(--borderStrong) / 1)'
    }
    return styleConfig?.style?.backgroundColor ?? theme?.dividerColor ?? 'rgb(var(--border) / 0.6)'
  }

  const backgroundColor = getBackgroundColor()

  return (
    <div
      className={ cn(
        'relative flex-shrink-0 select-none transition-colors duration-150',
        styleConfig?.className,
        isHovered && styleConfig?.hoverClassName,
      ) }
      style={ {
        width: size,
        cursor: canDrag
          ? 'col-resize'
          : 'default',
        backgroundColor,
        ...styleConfig?.style,
        ...(isHovered
          ? styleConfig?.hoverStyle
          : {}),
      } }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      onMouseDown={ canDrag
        ? handleMouseDown
        : undefined }
    >
      {/* 收起按钮 */ }
      { isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          { leftCollapsible && (
            <CollapseButton
              direction="left"
              collapsed={ leftCollapsed }
              onClick={ onCollapseLeft }
              theme={ theme }
            />
          ) }
          { rightCollapsible && (
            <CollapseButton
              direction="right"
              collapsed={ rightCollapsed }
              onClick={ onCollapseRight }
              theme={ theme }
            />
          ) }
        </div>
      ) }
    </div>
  )
})
