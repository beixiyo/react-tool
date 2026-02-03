'use client'

import type { StackButtonProps } from './types'
import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from 'utils'
import { ACTIVE_Z_INDEX, defaultConfig, sizeConfigs } from './constants'

export function StackButton({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  onActiveChange,
  size = 'md',
  width,
  height,
  className,
  itemClassName,
  activeClassName = 'bg-buttonPrimary border-0',
  inactiveClassName = 'bg-buttonSecondary border-0',
  leftClassName = '',
  rightClassName = '',
  stackedLeftClassName = 'border border-l border-background',
  stackedRightClassName = 'border border-r border-background',
  ...rest
}: StackButtonProps) {
  const isNumberSize = typeof size === 'number'
  const sizeConfig = isNumberSize
    ? {
        size,
        overlapMargin: -Math.floor(size * 0.25),
        activeGap: Math.floor(size * 0.1),
        borderRadius: Math.floor(size * 0.3),
      }
    : sizeConfigs[size || 'md']

  const config = { ...defaultConfig, ...sizeConfig, ...rest }
  const buttonSize = config.size
  /** width/height 优先级高于 size */
  const finalWidth = width ?? buttonSize
  const finalHeight = height ?? buttonSize

  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? items[0]?.id ?? '',
  )

  /** 确保在 items 异步加载时能正确初始化 activeId */
  if (!internalActiveId && items.length > 0) {
    setInternalActiveId(items[0].id)
  }

  const isControlled = controlledActiveId !== undefined
  const activeId = isControlled
    ? controlledActiveId
    : internalActiveId

  const handleSelect = (id: string) => {
    if (!isControlled) {
      setInternalActiveId(id)
    }
    onActiveChange?.(id)
  }

  const activeIndex = items.findIndex(item => item.id === activeId)

  const getZIndex = (index: number) => {
    if (index === activeIndex)
      return ACTIVE_Z_INDEX

    if (index < activeIndex) {
      return 10 + index
    }
    else {
      return 10 + (items.length - 1 - index)
    }
  }

  const getMarginLeft = (index: number) => {
    if (index === 0)
      return 0

    const prevIndex = index - 1

    /** 与激活按钮相邻：使用 activeGap */
    if (index === activeIndex || prevIndex === activeIndex) {
      return config.activeGap
    }

    /** 都在激活按钮的同一侧：使用重叠 */
    const bothOnLeft = index < activeIndex && prevIndex < activeIndex
    const bothOnRight = index > activeIndex && prevIndex > activeIndex

    if (bothOnLeft || bothOnRight) {
      return config.overlapMargin
    }

    return config.activeGap
  }

  // Apple 风格的弹簧过渡
  const springTransition = {
    type: 'spring' as const,
    stiffness: config.springStiffness,
    damping: config.springDamping,
    mass: config.springMass,
  }

  /** 颜色过渡的平滑缓动（Apple 使用 ease-out 曲线） */
  const colorTransition = {
    duration: config.colorTransitionDuration,
    ease: [0.25, 0.1, 0.25, 1] as const, // 类似 Apple ease 的 cubic-bezier
  }

  return (
    <div className={ cn('flex items-center', className) }>
      { items.map((item, index) => {
        const isActive = item.id === activeId
        const Icon = item.icon
        const zIndex = getZIndex(index)
        const marginLeft = getMarginLeft(index)

        return (
          <motion.button
            key={ item.id }
            layout
            onClick={ () => handleSelect(item.id) }
            className={ cn(
              'relative flex items-center justify-center cursor-pointer border',
              itemClassName,
              item.className,
              isActive
                ? activeClassName
                : inactiveClassName,
              !isActive && index < activeIndex && leftClassName,
              !isActive && index > activeIndex && rightClassName,
              !isActive && index < activeIndex && index > 0 && stackedLeftClassName,
              !isActive && index > activeIndex && index < items.length - 1 && stackedRightClassName,
            ) }
            style={ {
              width: finalWidth,
              height: finalHeight,
              borderRadius: config.borderRadius,
              zIndex,
              transition: `background-color ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1), border-color ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`,
            } }
            initial={ false }
            animate={ {
              marginLeft: index === 0
                ? 0
                : marginLeft,
            } }
            transition={ {
              marginLeft: springTransition,
              layout: springTransition,
            } }
            whileHover={ {
              scale: 1.02,
              transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
            } }
            whileTap={ {
              scale: 0.96,
              transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] },
            } }
          >
            <motion.div
              initial={ false }
              transition={ colorTransition }
              className={ cn(
                'flex items-center justify-center transition-all',
                config.iconSize,
                isActive
                  ? 'text-background'
                  : 'text-textSecondary/70',
              ) }
              style={ {
                transitionDuration: `${config.colorTransitionDuration}s`,
              } }
            >
              { Icon }
            </motion.div>
          </motion.button>
        )
      }) }
    </div>
  )
}
