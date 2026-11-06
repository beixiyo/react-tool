'use client'

import { useLatestCallback, useShortCutKey } from 'hooks'
import { memo, useCallback, useState } from 'react'
import { cn } from 'utils'
import { useAriaT } from '../../../i18n'
import type { DividerProps } from '../types'
import { CollapseButton } from './CollapseButton'

/**
 * 分隔条组件
 */
export const Divider = memo(({
  index,
  panelId,
  rightPanelId,
  value,
  min,
  max,
  onResize,
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
  showCollapseButtons = true,
  showDividerLine = true,
}: DividerProps) => {
  const t = useAriaT()
  const [isHovered, setIsHovered] = useState(false)
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  const handleDragStart = useCallback(
    (event: React.MouseEvent) => {
      onDragStart(index, event)
    },
    [index, onDragStart],
  )

  const handleKeyboard = useLatestCallback((event: KeyboardEvent) => {
    if (event.target !== element) return
    if (event.key === 'Enter') {
      if (!leftCollapsible && !rightCollapsible) return
      if (leftCollapsible) onCollapseLeft()
      else onCollapseRight()
    }
    else {
      const movement = event.key === 'Home'
        ? 'min'
        : event.key === 'End'
        ? 'max'
        : event.key === 'ArrowLeft'
        ? -10
        : 10
      onResize(movement)
    }
    event.preventDefault()
    event.stopPropagation()
  })
  const shortcut = { el: element, enabled: draggable, preventDefault: false, onKeyDown: handleKeyboard }
  useShortCutKey({ ...shortcut, key: 'ArrowLeft' })
  useShortCutKey({ ...shortcut, key: 'ArrowRight' })
  useShortCutKey({ ...shortcut, key: 'Home' })
  useShortCutKey({ ...shortcut, key: 'End', allowRepeat: false })
  useShortCutKey({ ...shortcut, key: 'Enter', allowRepeat: false })

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
      return styleConfig?.hoverStyle?.backgroundColor ?? theme?.dividerHoverColor ?? 'rgb(var(--border3) / 1)'
    }
    return styleConfig?.style?.backgroundColor ?? theme?.dividerColor ?? 'rgb(var(--border) / 0.6)'
  }

  const backgroundColor = getBackgroundColor()

  return (
    <div
      ref={ setElement }
      role="separator"
      aria-controls={ panelId }
      aria-valuenow={ Math.round(value) }
      aria-valuemin={ Math.round(min) }
      aria-valuemax={ Math.round(max) }
      aria-disabled={ !canDrag }
      aria-orientation="vertical"
      aria-label={ t('resizePanel') }
      tabIndex={ canDrag
        ? 0
        : -1 }
      className={ cn(
        'group relative shrink-0 select-none transition-colors duration-150',
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
        ...(!showDividerLine
          ? { backgroundColor: 'transparent' }
          : {}),
      } }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      onMouseDown={ canDrag
        ? handleDragStart
        : undefined }
    >
      { /* 收起按钮 */ }
      { showCollapseButtons && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
          { leftCollapsible && (
            <CollapseButton
              direction="left"
              panelId={ panelId }
              collapsed={ leftCollapsed }
              onClick={ onCollapseLeft }
              theme={ theme }
            />
          ) }
          { rightCollapsible && (
            <CollapseButton
              direction="right"
              panelId={ rightPanelId }
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
