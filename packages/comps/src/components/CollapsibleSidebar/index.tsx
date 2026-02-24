'use client'

import type { CollapsibleSidebarProps } from './types'
import { Menu } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'

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

  // Header 配置
  const {
    show: showHeader = true,
    title = '侧边栏',
    titleClassName,
    className: headerClassName,
    children: headerChildren,
  } = header

  const sidebarWidth = isCollapsed
    ? collapsedWidth
    : expandedWidth

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

  return (
    <>
      {/* 遮罩层 */ }
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

      {/* 侧边栏主体 */ }
      <motion.div
        className={ cn(
          'relative flex flex-col bg-background dark:bg-background',
          position === 'left'
            ? 'border-r border-border'
            : 'border-l border-border',
          'overflow-hidden',
          overlay && 'fixed inset-y-0 lg:relative',
          position === 'left'
            ? 'left-0'
            : 'right-0',
          className,
        ) }
        style={ {
          zIndex,
          width: sidebarWidth,
          ...style,
        } }
        variants={ sidebarVariants }
        animate={ isCollapsed
          ? 'collapsed'
          : 'expanded' }
        initial={ false }
        transition={ animationConfig }
        data-collapsed={ isCollapsed
          ? 'true'
          : 'false' }
      >
        {/* Header 区域 */ }
        { showHeader && (
          <div
            className={ cn(
              'flex items-center justify-between px-4 py-3 border-b border-border bg-background2',
              headerClassName,
            ) }
          >
            { headerChildren || (
              /** 默认 header 布局 */
              <>
                {/* 标题 */ }
                <motion.h3
                  className={ cn(
                    'font-semibold text-text truncate',
                    titleClassName,
                  ) }
                  animate={ {
                    opacity: isCollapsed
                      ? 0
                      : 1,
                    x: isCollapsed
                      ? -10
                      : 0,
                  } }
                  transition={ animationConfig }
                >
                  { title }
                </motion.h3>

                {/* 收起按钮 */ }
                { showToggleButton && (
                  <motion.div
                    animate={ {
                      rotate: isCollapsed
                        ? 0
                        : 180,
                    } }
                    transition={ animationConfig }
                  >
                    <Button
                      size="sm"
                      iconOnly
                      leftIcon={ <Menu size={ 14 } /> }
                      className={ cn(
                        'h-6 w-6 p-0',
                        toggleButtonClassName,
                      ) }
                      onClick={ handleToggle }
                      disabled={ disabled }
                      aria-label={ isCollapsed
                        ? '展开侧边栏'
                        : '收起侧边栏' }
                    />
                  </motion.div>
                ) }
              </>
            ) }
          </div>
        ) }

        {/* 内容区域 */ }
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
