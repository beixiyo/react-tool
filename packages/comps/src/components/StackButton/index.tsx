'use client'

import type { StackButtonProps } from './types'
import { motion } from 'motion/react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { ACTIVE_Z_INDEX, defaultConfig, sizeConfigs } from './constants'

export const StackButton = memo(({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  onActiveChange,
  onItemDoubleClick,
  size = 'md',
  width,
  height,
  activeWidth,
  className,
  itemClassName,
  activeClassName = 'bg-button border-0',
  inactiveClassName = 'bg-button2 border-0',
  leftClassName = '',
  rightClassName = '',
  stackedLeftClassName = 'border-background',
  stackedRightClassName = 'border-background',
  stackedLeftStyle,
  stackedRightStyle,

  /** 以下为配置项，从 rest 中显式取出，避免与根元素 DOM 属性混淆 */
  overlapMargin,
  activeGap,
  borderRadius,
  iconSize,
  springStiffness,
  springDamping,
  springMass,
  colorTransitionDuration,

  ...rest
}: StackButtonProps) => {
  const isNumberSize = typeof size === 'number'
  const sizeConfig = isNumberSize
    ? {
        size,
        overlapMargin: -Math.floor(size * 0.25),
        activeGap: Math.floor(size * 0.1),
        borderRadius: Math.floor(size * 0.3),
      }
    : sizeConfigs[size || 'md']

  /** 仅把显式声明且有值的配置项合并进 config，其余 rest 透传给根元素 */
  const configOverrides = pickDefined({
    overlapMargin,
    activeGap,
    borderRadius,
    iconSize,
    springStiffness,
    springDamping,
    springMass,
    colorTransitionDuration,
  })

  const config = { ...defaultConfig, ...sizeConfig, ...configOverrides }
  const buttonSize = config.size
  /** width/height 优先级高于 size */
  const finalWidth = width ?? buttonSize
  const finalHeight = height ?? buttonSize
  const finalActiveWidth = activeWidth ?? finalWidth

  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? items[0]?.id ?? '',
  )

  /** 确保在 items 异步加载时能正确初始化 activeId */
  if (!internalActiveId && items.length > 0) {
    setInternalActiveId(items[0].id)
  }

  const isControlled = controlledActiveId !== undefined
  const rawActiveId = isControlled
    ? controlledActiveId
    : internalActiveId

  const handleSelect = (id: string) => {
    if (!isControlled) {
      setInternalActiveId(id)
    }
    onActiveChange?.(id)
  }

  const rawActiveIndex = items.findIndex(item => item.id === rawActiveId)
  /** activeId 不匹配任何项（受控传入非法 id / items 异步变更后旧 id 失效）时回退到首项，避免布局与层级以 -1 为基准错乱 */
  const activeIndex = rawActiveIndex === -1
    ? (items.length > 0
        ? 0
        : -1)
    : rawActiveIndex
  /** 解析后的激活 id，确保 isActive 判断与布局基准一致 */
  const activeId = activeIndex >= 0
    ? items[activeIndex].id
    : rawActiveId

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
    <div
      className={ cn('flex items-center', className) }
      { ...rest }
    >
      { items.map((item, index) => {
        const isActive = item.id === activeId
        const Icon = item.icon
        const zIndex = getZIndex(index)
        const marginLeft = getMarginLeft(index)
        const isStackedLeft = !isActive && index < activeIndex && index > 0
        const isStackedRight = !isActive && index > activeIndex && index < items.length - 1

        const showActiveIcon = isActive && item.activeIcon

        return (
          <motion.button
            key={ item.id }
            layout
            onClick={ () => handleSelect(item.id) }
            onDoubleClick={ onItemDoubleClick
              ? () => onItemDoubleClick(item.id)
              : undefined }
            className={ cn(
              'relative flex items-center justify-center cursor-pointer border',
              itemClassName,
              item.className,
              isActive
                ? activeClassName
                : inactiveClassName,
              !isActive && index < activeIndex && leftClassName,
              !isActive && index > activeIndex && rightClassName,
              isStackedLeft && stackedLeftClassName,
              isStackedRight && stackedRightClassName,
            ) }
            style={ {
              width: isActive
                ? (item.activeWidth ?? finalActiveWidth)
                : finalWidth,
              height: finalHeight,
              marginLeft: index === 0
                ? 0
                : marginLeft,
              borderRadius: config.borderRadius,
              zIndex,
              transition: `background-color ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1), border-color ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow ${config.colorTransitionDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`,
              ...(isStackedLeft && {
                borderLeftWidth: '3px',
                ...stackedLeftStyle,
              }),
              ...(isStackedRight && {
                borderRightWidth: '3px',
                ...stackedRightStyle,
              }),
            } }
            initial={ false }
            transition={ { layout: springTransition } }
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
                showActiveIcon
                  ? undefined
                  : config.iconSize,
                isActive
                  ? 'text-background'
                  : 'text-text2/70',
              ) }
              style={ {
                transitionDuration: `${config.colorTransitionDuration}s`,
              } }
            >
              { showActiveIcon
                ? item.activeIcon
                : Icon }
            </motion.div>
          </motion.button>
        )
      }) }
    </div>
  )
})

StackButton.displayName = 'StackButton'

/** 过滤掉值为 undefined 的字段，避免覆盖已有默认配置 */
function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}
