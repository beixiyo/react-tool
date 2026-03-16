'use client'

import type { CollapsibleSidebarProps } from './types'
import { ChevronsLeft, Menu } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo } from 'react'
import { cn } from 'utils'

export const CollapsibleSidebar = memo<CollapsibleSidebarProps>((props) => {
  const {
    isCollapsed = false,
    onToggle,
    expandedWidth = 280,
    collapsedWidth = 0,
    position = 'left',
    showToggleButton = true,
    animationDuration = 0.25,
    animationType = 'spring',
    overlay = false,
    overlayClassName,
    toggleButtonClassName,
    contentClassName,
    className,
    style,
    children,
    header = {},
    disabled = false,
    zIndex = 10,
  } = props

  const handleToggle = useCallback(() => {
    if (disabled)
      return
    onToggle?.()
  }, [onToggle, disabled])

  const {
    show: showHeader = true,
    title = '侧边栏',
    titleClassName,
    className: headerClassName,
    children: headerChildren,
  } = header

  const isFullyHidden = isCollapsed && collapsedWidth === 0

  const animationConfig = useMemo(() => (
    animationType === 'spring'
      ? { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 } as const
      : { type: 'tween', duration: animationDuration, ease: 'easeOut' } as const
  ), [animationType, animationDuration])

  return (
    <>
      {/* 遮罩层 */}
      <AnimatePresence>
        { overlay && !isCollapsed && (
          <motion.div
            className={ cn(
              'fixed inset-0 bg-black/20 backdrop-blur-xs lg:hidden',
              overlayClassName,
            ) }
            style={ { zIndex: zIndex - 1 } }
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            transition={ { duration: animationDuration } }
            onClick={ handleToggle }
          />
        ) }
      </AnimatePresence>

      {/* 收起时的悬浮展开按钮（仅 collapsedWidth=0 时渲染） */}
      <AnimatePresence>
        { showToggleButton && isFullyHidden && (
          <motion.button
            type="button"
            onClick={ handleToggle }
            disabled={ disabled }
            className={ cn(
              'fixed top-4 flex items-center justify-center w-9 h-9 rounded-xl',
              'bg-background border border-border/60 text-text2',
              'hover:text-text hover:bg-background2 transition-colors',
              position === 'left' ? 'left-4' : 'right-4',
              toggleButtonClassName,
            ) }
            style={ { zIndex } }
            initial={ { opacity: 0, scale: 0.8 } }
            animate={ { opacity: 1, scale: 1 } }
            exit={ { opacity: 0, scale: 0.8 } }
            transition={ { duration: 0.15 } }
            aria-label="展开侧边栏"
          >
            <Menu size={ 16 } />
          </motion.button>
        ) }
      </AnimatePresence>

      {/* 侧边栏主体 */}
      <motion.div
        className={ cn(
          'relative flex flex-col bg-background overflow-hidden',
          position === 'left'
            ? 'border-r border-border'
            : 'border-l border-border',
          overlay && 'fixed inset-y-0 lg:relative',
          position === 'left' ? 'left-0' : 'right-0',
          className,
        ) }
        style={ { zIndex, ...style } }
        animate={ { width: isCollapsed ? collapsedWidth : expandedWidth } }
        initial={ false }
        transition={ animationConfig }
        data-collapsed={ isCollapsed }
      >
        {/* Header */}
        { showHeader && (
          <div
            className={ cn(
              'flex items-center justify-between px-4 py-3',
              headerClassName,
            ) }
          >
            { headerChildren || (
              <>
                <motion.h3
                  className={ cn('font-semibold text-text truncate', titleClassName) }
                  animate={ {
                    opacity: isCollapsed ? 0 : 1,
                    x: isCollapsed ? -10 : 0,
                  } }
                  transition={ animationConfig }
                >
                  { title }
                </motion.h3>

                { showToggleButton && !isFullyHidden && (
                  <button
                    type="button"
                    onClick={ handleToggle }
                    disabled={ disabled }
                    className={ cn(
                      'flex items-center justify-center w-7 h-7 rounded-lg',
                      'text-text2 hover:text-text hover:bg-background2/80 transition-colors',
                      toggleButtonClassName,
                    ) }
                    aria-label={ isCollapsed ? '展开侧边栏' : '收起侧边栏' }
                  >
                    <ChevronsLeft
                      size={ 15 }
                      className={ cn(
                        'transition-transform duration-200',
                        isCollapsed && 'rotate-180',
                      ) }
                    />
                  </button>
                ) }
              </>
            ) }
          </div>
        ) }

        {/* 内容 */}
        <div
          className={ cn(
            'flex-1 h-full w-full overflow-y-auto hide-scroll',
            contentClassName,
          ) }
        >
          { children }
        </div>
      </motion.div>
    </>
  )
})

CollapsibleSidebar.displayName = 'CollapsibleSidebar'
