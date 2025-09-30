'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import type { CollapsibleSidebarProps } from './types'

export const CollapsibleSidebar = memo<CollapsibleSidebarProps>((props) => {
  const {
    isCollapsed = false,
    onToggle,
    expandedWidth = 280,
    collapsedWidth = 0,
    position = 'left',
    showToggleButton = true,
    toggleButtonPosition = 'inside',
    animationDuration = 0.25,
    animationType = 'spring',
    overlay = false,
    overlayClassName,
    toggleButtonClassName,
    contentClassName,
    className,
    style,
    children,
    disabled = false,
    zIndex = 10,
  } = props

  const handleToggle = useCallback(() => {
    if (disabled) return
    onToggle?.()
  }, [onToggle, disabled])

  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth

  const animationConfig = animationType === 'spring'
    ? {
        type: 'spring',
        stiffness: 420,
        damping: 26,
        mass: 0.7,
      }
    : {
        type: 'tween',
        duration: animationDuration,
        ease: 'easeOut',
      }

  const sidebarVariants = {
    expanded: {
      width: expandedWidth,
    },
    collapsed: {
      width: collapsedWidth,
    },
  }

  const toggleButtonVariants = {
    expanded: {
      [position]: expandedWidth - (toggleButtonPosition === 'inside' ? 36 : -16),
    },
    collapsed: {
      [position]: collapsedWidth + (toggleButtonPosition === 'inside' ? 12 : -16),
    },
  }

  const ToggleButton = showToggleButton && (
    <motion.button
      className={ cn(
        'absolute top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full',
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'shadow-md hover:shadow-lg transition-shadow',
        'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        toggleButtonClassName,
      ) }
      style={ { zIndex: zIndex + 1 } }
      variants={ toggleButtonVariants }
      animate={ isCollapsed ? 'collapsed' : 'expanded' }
      transition={ animationConfig }
      onClick={ handleToggle }
      disabled={ disabled }
      aria-label={ isCollapsed ? '展开侧边栏' : '收起侧边栏' }
    >
      { position === 'left'
        ? (isCollapsed ? <ChevronRight size={ 16 } /> : <ChevronLeft size={ 16 } />)
        : (isCollapsed ? <ChevronLeft size={ 16 } /> : <ChevronRight size={ 16 } />) }
    </motion.button>
  )

  return (
    <>
      {/* 遮罩层 */}
      { overlay && !isCollapsed && (
        <motion.div
          className={ cn(
            'fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden',
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

      {/* 侧边栏主体 */}
      <motion.div
        className={ cn(
          'relative flex flex-col bg-white dark:bg-gray-900',
          position === 'left'
            ? 'border-r border-gray-200 dark:border-gray-700'
            : 'border-l border-gray-200 dark:border-gray-700',
          'overflow-hidden',
          overlay && 'fixed inset-y-0 lg:relative',
          position === 'left' ? 'left-0' : 'right-0',
          className,
        ) }
        style={ {
          zIndex,
          width: sidebarWidth,
          ...style,
        } }
        variants={ sidebarVariants }
        animate={ isCollapsed ? 'collapsed' : 'expanded' }
        initial={ false }
        transition={ animationConfig }
        data-collapsed={ isCollapsed ? 'true' : 'false' }
      >
        {/* 内容区域 */}
        <div
          className={ cn(
            'flex-1 h-full w-full overflow-y-auto',
            contentClassName,
          ) }
        >
          { children }
        </div>
      </motion.div>

      {/* 切换按钮 */}
      { ToggleButton }
    </>
  )
})

CollapsibleSidebar.displayName = 'CollapsibleSidebar'
