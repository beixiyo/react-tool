'use client'

import type { StackButtonConfig, StackButtonProps } from './types'
import { motion } from 'motion/react'
import { useState } from 'react'

const defaultConfig: Required<StackButtonConfig> = {
  buttonSize: 48,
  overlapMargin: -12,
  activeGap: 4,
  borderRadius: 14,
  iconSize: 'size-5',
  iconStrokeWidth: 2,
  activeBackground: 'rgb(var(--buttonPrimary))',
  inactiveBackground: 'rgb(var(--background))',
  activeBorderColor: 'rgb(var(--buttonPrimary))',
  inactiveBorderColor: 'rgb(var(--border))',
  activeIconColor: 'rgb(var(--background))',
  inactiveIconColor: 'rgb(var(--textSecondary) / 0.7)',
  activeShadow: '0 2px 8px rgb(0 0 0 / 0.12)',
  inactiveShadow: '0 0.5px 2px rgb(0 0 0 / 0.04)',
  springStiffness: 280,
  springDamping: 26,
  springMass: 0.9,
  colorTransitionDuration: 0.35,
}

const ACTIVE_Z_INDEX = 100

export function StackButton({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  onActiveChange,
  config: userConfig,
  className,
}: StackButtonProps) {
  const config = { ...defaultConfig, ...userConfig }

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
    <div className={ `flex items-center ${className ?? ''}` }>
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
            className="relative flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400"
            style={ {
              width: config.buttonSize,
              height: config.buttonSize,
              borderRadius: config.borderRadius,
              zIndex,
              backgroundColor: isActive
                ? config.activeBackground
                : config.inactiveBackground,
              boxShadow: isActive
                ? config.activeShadow
                : config.inactiveShadow,
              borderColor: isActive
                ? config.activeBorderColor
                : config.inactiveBorderColor,
              borderWidth: 1,
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
              animate={ {
                scale: isActive
                  ? 1
                  : 0.95,
              } }
              transition={ colorTransition }
              style={ {
                color: isActive
                  ? config.activeIconColor
                  : config.inactiveIconColor,
                transition: `color ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
