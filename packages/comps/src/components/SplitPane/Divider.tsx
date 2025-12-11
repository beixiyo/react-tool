import type { DividerProps } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useState } from 'react'
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

  /** 判断是否可拖拽（两侧都未收起时才可拖拽） */
  const canDrag = !leftCollapsed && !rightCollapsed

  return (
    <motion.div
      className="relative flex-shrink-0 select-none"
      style={ {
        width: size,
        cursor: canDrag
          ? 'col-resize'
          : 'default',
      } }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      onMouseDown={ canDrag
        ? handleMouseDown
        : undefined }
    >
      {/* 分隔条背景 */ }
      <div
        className="absolute inset-0 transition-colors duration-150"
        style={ {
          backgroundColor: isHovered
            ? theme?.dividerHoverColor ?? 'rgb(var(--borderStrong) / 1)'
            : theme?.dividerColor ?? 'rgb(var(--border) / 0.6)',
        } }
      />

      {/* 分隔线 */ }
      <motion.div
        className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
        style={ {
          backgroundColor: 'rgb(var(--border) / 1)',
        } }
        animate={ {
          opacity: isHovered
            ? 0
            : 1,
        } }
      />

      {/* 收起按钮 */ }
      <AnimatePresence>
        { isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 左侧面板收起按钮 */ }
            { leftCollapsible && (
              <CollapseButton
                direction="left"
                collapsed={ leftCollapsed }
                onClick={ onCollapseLeft }
                theme={ theme }
              />
            ) }

            {/* 右侧面板收起按钮 */ }
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
      </AnimatePresence>
    </motion.div>
  )
})
