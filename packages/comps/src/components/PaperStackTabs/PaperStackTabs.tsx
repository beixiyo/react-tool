"use client"


import { useState, useRef, memo, Activity } from "react"
import { motion } from "framer-motion"
import { cn } from "utils"
import type { PaperStackTabsProps } from './types'


export const PaperStackTabs = memo<PaperStackTabsProps>(({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const directionRef = useRef<number>(0) // 0: 初始, 1: 前进, -1: 后退
  const prevActiveIndexRef = useRef<number>(0)

  const handleTabChange = (index: number) => {
    if (index !== activeIndex) {
      directionRef.current = index > activeIndex ? 1 : -1
      prevActiveIndexRef.current = activeIndex
      setActiveIndex(index)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Tab Navigation */ }
      <div className="flex gap-2 mb-8 flex-wrap">
        { items.map((item, index) => (
          <button
            key={ item.id }
            onClick={ () => handleTabChange(index) }
            className={ cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeIndex === index
                ? "bg-info text-white"
                : "bg-backgroundSubtle text-textSecondary hover:bg-backgroundSubtle/80",
            ) }
          >
            { item.title }
          </button>
        )) }
      </div>

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
              mode={ shouldShow ? "visible" : "hidden" }
            >
              { shouldShow && (
                <motion.div
                  className={ cn(
                    "absolute inset-0 bg-white dark:bg-background rounded-xl p-8 overflow-auto",
                    isActive
                      ? "shadow-xl"
                      : "shadow-lg pointer-events-none",
                  ) }
                  initial={ (() => {
                    // 如果是从隐藏变为活跃，执行进入动画
                    if (isActive && directionRef.current !== 0) {
                      return {
                        rotate: directionRef.current > 0 ? 8 : -8,
                        x: directionRef.current > 0 ? 100 : -100,
                        opacity: 0.3,
                      }
                    }
                    // 如果是从活跃变为堆叠，从当前位置开始
                    if (isStacked && prevActiveIndexRef.current === index) {
                      return false
                    }
                    // 其他情况不执行初始动画
                    return false
                  })() }
                  animate={ {
                    rotate: isActive ? 0 : -(stackPosition! + 1) * 2,
                    x: isActive ? 0 : (stackPosition! + 1) * 8,
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
                      ease: "easeOut",
                    } }
                  style={ {
                    zIndex: isActive ? 10 : stackPosition! + 1,
                  } }
                >
                  <div className="text-textPrimary">{ item.content }</div>
                </motion.div>
              ) }
            </Activity>
          )
        }) }
      </div>
    </div>
  )
})
