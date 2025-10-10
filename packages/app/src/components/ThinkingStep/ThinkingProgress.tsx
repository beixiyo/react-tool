'use client'

import type { ThinkingStepItemProps } from './ThinkingStepItem'
import type { StepData } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollBottom } from 'hooks'
import React, { memo, useRef, type RefObject } from 'react'
import { cn } from 'utils'
import { ThinkingStepItem } from './ThinkingStepItem'

export const ThinkingProcess = memo<ThinkingProcessProps>(({
  steps = [],
  thinkDone,
  className,
  staggerDelay = 0.2,
  onStepClick,
  activeStepIndex,
}: ThinkingProcessProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  useScrollBottom(scrollContainerRef as RefObject<HTMLElement>, [steps.length])

  return (
    <div
      ref={ scrollContainerRef }
      className={ cn(
        'rounded-lg h-full overflow-auto hide-scroll',
        className,
      ) }
      aria-label="思考过程步骤"
    >
      <motion.div
        className="relative" // 为子元素的绝对定位提供基础
        variants={ listVariants(staggerDelay) }
        initial="hidden"
        animate="visible"
        aria-live="polite" // 向屏幕阅读器宣告内容更新
      >
        {/* AnimatePresence 处理项目进入/退出动画，对于仅添加的场景，它确保新项目正确应用入场动画 */ }
        <AnimatePresence initial={ false }>
          { steps.map((stepData, index) => {
            const isLast = index === steps.length - 1
            const { id, ...stepSpecificProps } = stepData

            const stepProps: ThinkingStepItemProps = {
              ...stepSpecificProps,
              index,
              isLast,
              onClick: onStepClick,
              isActive: index === activeStepIndex,
              done: thinkDone
                ? true
                : index !== steps.length - 1,
            }

            /** 优先使用 stepData.id 作为 key，否则使用 index */
            const key = id ?? index

            return <ThinkingStepItem key={ key } { ...stepProps } />
          }) }
        </AnimatePresence>
      </motion.div>
    </div>
  )
})

ThinkingProcess.displayName = 'ThinkingProcess'

/** 列表容器的动画变体 */
function listVariants(staggerDelay: number) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren', // 先动画化容器
        staggerChildren: staggerDelay, // 对子元素应用交错效果
      },
    },
  }
}

export interface ThinkingProcessProps {
  thinkDone?: boolean
  /**
   * 要显示的步骤数组。每个元素都是一个配置对象。
   * @default []
   */
  steps?: StepData[]
  /**
   * 主容器 div 的额外 CSS 类。
   */
  className?: string
  /**
   * 每个步骤动画开始之间的延迟时间（秒）。
   * @default 0.2
   */
  staggerDelay?: number
  /**
   * 用于渲染每个步骤的自定义组件。
   * 当你需要超出 ThinkingStepProps 的高度自定义步骤渲染时很有用。
   * 必须接受 ThinkingStepProps。
   * @default ThinkingStep
   */
  StepComponent?: React.ComponentType<ThinkingStepItemProps>
  /**
   * 当步骤项被点击时的回调函数。
   */
  onStepClick?: (index: number) => void
  /**
   * 当前活动的步骤索引，用于高亮显示。
   */
  activeStepIndex?: number | null
}
