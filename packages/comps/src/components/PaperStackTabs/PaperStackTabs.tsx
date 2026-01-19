'use client'

import type { PaperStackTabsProps } from './types'
import { motion } from 'motion/react'
import { Activity, memo, useEffect, useRef } from 'react'
import { cn } from 'utils'

export const PaperStackTabs = memo<PaperStackTabsProps>(({
  items,
  activeIndex,
  cardClassName,
  activeCardClassName,
  stackedCardClassName,
}) => {
  const directionRef = useRef<number>(0) // 0: 初始, 1: 前进, -1: 后退
  const prevActiveIndexRef = useRef<number>(0)

  useEffect(() => {
    if (activeIndex !== prevActiveIndexRef.current) {
      directionRef.current = activeIndex > prevActiveIndexRef.current
        ? 1
        : -1
      prevActiveIndexRef.current = activeIndex
    }
  }, [activeIndex])

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Paper Stack Container */ }
      <div className="relative w-full min-h-[300px]">
        {/* 为每个标签创建卡片，使用 Activity 保留状态 */ }
        { items.map((item, index) => {
          const isActive = index === activeIndex
          const stackPosition = activeIndex > index
            ? activeIndex - index - 1
            : null
          const isStacked = stackPosition !== null && stackPosition < 3
          const shouldShow = isActive || isStacked

          return (
            <Activity
              key={ item.id }
              mode={ shouldShow
                ? 'visible'
                : 'hidden' }
            >
              { shouldShow && (
                <motion.div
                  className={ cn(
                    'absolute inset-0 overflow-auto bg-background rounded-xl p-8 shadow-shadow shadow-lg',
                    cardClassName,
                    isActive
                      ? activeCardClassName
                      : cn('pointer-events-none', stackedCardClassName),
                  ) }
                  initial={ (() => {
                    /** 如果是从隐藏变为活跃，执行进入动画 */
                    if (isActive && directionRef.current !== 0) {
                      return {
                        rotate: directionRef.current > 0
                          ? 8
                          : -8,
                        x: directionRef.current > 0
                          ? 100
                          : -100,
                        opacity: 0.3,
                      }
                    }
                    /** 如果是从活跃变为堆叠，从当前位置开始 */
                    if (isStacked && prevActiveIndexRef.current === index) {
                      return false
                    }
                    /** 其他情况不执行初始动画 */
                    return false
                  })() }
                  animate={ {
                    rotate: isActive
                      ? 0
                      : -(stackPosition! + 1) * 2,
                    x: isActive
                      ? 0
                      : (stackPosition! + 1) * 8,
                    opacity: 1,
                  } }
                  transition={ isActive
                    ? {
                        opacity: {
                          duration: 0.25,
                          ease: [0.4, 0, 0.2, 1],
                        },
                        x: {
                          duration: 0.35,
                          ease: [0.25, 0.1, 0.25, 1],
                        },
                        rotate: {
                          duration: 0.35,
                          ease: [0.25, 0.1, 0.25, 1],
                        },
                      }
                    : {
                        duration: 0.2,
                        ease: 'easeOut',
                      } }
                  style={ {
                    zIndex: isActive
                      ? 10
                      : stackPosition! + 1,
                  } }
                >
                  { item.content }
                </motion.div>
              ) }
            </Activity>
          )
        }) }
      </div>
    </div>
  )
})
