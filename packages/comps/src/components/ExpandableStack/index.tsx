import type { ExpandableStackItem, ExpandableStackProps } from './types'
import { useKeyboardLayer } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useMemo, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'

function ExpandableStackBase<T extends ExpandableStackItem>(props: ExpandableStackProps<T>) {
  const {
    items,
    expandedId,
    defaultExpandedId = null,
    onExpandedChange,
    renderCollapsed,
    renderExpanded,
    position = 'top-right',
    containerOffset,
    stackSpacing = 0,
    collapsedOpacity = 0.1,
    hoverOpacity = 1,
    expandedFixed = true,
    expandedPlacement = 'top-right',
    expandedWidth = 600,
    expandedMaxHeight = 'calc(100vh - 2rem)',
    zIndexBase = 50,
    enableEscClose = true,
    animation,
    initialOffset,
    className,
    itemClassName,
    expandedClassName,
    collapsedClassName,
    style,
  } = props

  const [uncontrolledId, setUncontrolledId] = useState<string | null>(defaultExpandedId)
  const isControlled = typeof expandedId !== 'undefined'
  const currentExpandedId = isControlled
    ? expandedId!
    : uncontrolledId

  const setExpanded = (id: string | null) => {
    if (!isControlled)
      setUncontrolledId(id)
    onExpandedChange?.(id)
  }

  /** 按 ESC 关闭展开态 */
  useKeyboardLayer({
    active: !!currentExpandedId,
    keys: ['Escape'],
    priority: typeof style?.zIndex === 'number'
      ? style.zIndex
      : Z.toast,
    handlerEnabled: enableEscClose,
    allowRepeat: false,
    onKeyDown: () => setExpanded(null),
  })

  /** 是否由 containerOffset 接管水平方向定位（传入对应 side 的内联值时去掉默认 right-4/left-4 类，避免冲突叠加） */
  const hasRightOffset = typeof containerOffset?.right === 'number'
  const hasLeftOffset = typeof containerOffset?.left === 'number'

  const placementClass = useMemo(() => {
    const base = 'pointer-events-none fixed z-toast flex flex-col items-end'
    if (position === 'top-right') {
      return cn(base, !hasRightOffset && 'right-4', 'top-0')
    }
    return cn(base, !hasLeftOffset && 'left-4', 'top-0', 'items-start')
  }, [position, hasRightOffset, hasLeftOffset])

  const containerStyle = useMemo(() => {
    const top = containerOffset?.top ?? 0
    const right = containerOffset?.right
    const left = containerOffset?.left
    return {
      top,
      ...(typeof right === 'number'
        ? { right }
        : {}),
      ...(typeof left === 'number'
        ? { left }
        : {}),
      ...style,
    } as React.CSSProperties
  }, [containerOffset, style])

  const transition = useMemo(() => {
    if (animation?.type === 'tween') {
      return { type: 'tween' as const, duration: animation.duration ?? 0.25 }
    }
    return {
      type: 'spring' as const,
      stiffness: animation?.stiffness ?? 300,
      damping: animation?.damping ?? 30,
    }
  }, [animation])

  const initOffset = {
    x: initialOffset?.x ?? -100,
    y: initialOffset?.y ?? 100,
  }

  return (
    <div className={ cn(placementClass, className) } style={ containerStyle }>
      <AnimatePresence>
        { items.map((item, index) => {
          const isExpanded = currentExpandedId === item.id

          const expandedPlacementClass = expandedPlacement === 'center'
            ? 'fixed left-1/2 top-8 -translate-x-1/2'
            : (position === 'top-right'
                ? 'fixed right-4 top-4'
                : 'fixed left-4 top-4')

          return (
            <motion.div
              key={ item.id }
              layout
              whileHover={ { opacity: hoverOpacity } }
              initial={ { opacity: 0, scale: 0.8, x: initOffset.x, y: initOffset.y } }
              animate={ isExpanded
                ? { opacity: 1, scale: 1, x: 0, y: 0, zIndex: zIndexBase }
                : { opacity: collapsedOpacity, x: 0, y: 0, zIndex: items.length - index } }
              exit={ { opacity: 0, scale: 0.5, transition: { duration: 0.2 } } }
              transition={ transition }
              className={ cn(
                'pointer-events-auto overflow-hidden rounded-xl border shadow-lg backdrop-blur-xs transition-shadow',
                itemClassName,
                isExpanded
                  ? cn(
                      expandedFixed && expandedPlacementClass,
                      'flex flex-col',
                      expandedClassName,
                    )
                  : cn('cursor-pointer', collapsedClassName),
              ) }
              style={ isExpanded
                ? {
                    width: typeof expandedWidth === 'number'
                      ? `${expandedWidth}px`
                      : expandedWidth,
                    maxHeight: expandedMaxHeight,
                  }
                : { marginTop: index === 0
                    ? 0
                    : stackSpacing } }
              onClick={ () => {
                if (!isExpanded)
                  setExpanded(item.id)
              } }
            >
              { isExpanded
                ? renderExpanded(item, index, () => setExpanded(null))
                : renderCollapsed(item, index) }
            </motion.div>
          )
        }) }
      </AnimatePresence>
    </div>
  )
}

/**
 * 通用可展开堆叠组件
 * - 右上角堆叠小卡片，点击展开为大卡片
 * - 展开态使用 fixed 定位避免与堆叠偏移叠加
 */
export const ExpandableStack = memo(ExpandableStackBase) as typeof ExpandableStackBase
