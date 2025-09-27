'use client'

import type { StepData } from './types'
import { useWatchThrottle } from 'hooks'
import React, { useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { StepContent } from './StepContent'
import { ThinkingProcess } from './ThinkingProgress'

export * from './types'

export const ThinkingStep: React.FC<ThinkingStepProps> = ({
  thinkDone,
  currentSteps,
  thinkingProcessClassName,
  className,
  rightPanelClassName,
  leftPanelClassName,
}) => {
  const renderStep = useWatchThrottle<StepData[]>(currentSteps, 50)
  const [activeStepIndex, setActiveStepIndex] = useState<number>()
  const [userHasClickedStep, setUserHasClickedStep] = useState(false)

  const prevCurrentStepsLength = useRef(currentSteps.length)

  /**
   * 如果步骤数量增加（新的流式数据），则重置用户点击状态，允许自动滚动到底部
   */
  useEffect(() => {
    if (currentSteps.length > prevCurrentStepsLength.current) {
      setUserHasClickedStep(false)
      setActiveStepIndex(undefined) // 取消特定的高亮和滚动目标
    }
    prevCurrentStepsLength.current = currentSteps.length
  }, [currentSteps])

  const handleStepClick = (index: number) => {
    setActiveStepIndex(index)
    setUserHasClickedStep(true) // 用户已点击，优先滚动到指定项
  }

  /** 仅当用户未点击特定步骤且没有激活的步骤索引时，才允许自动滚动到底部 */
  const enableAutoScrollToBottom = !userHasClickedStep && !activeStepIndex

  return (
    <div className={ cn('relative h-96 max-w-4xl w-full flex overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20', className) }>
      {/* 左侧: 思考过程组件 */ }
      <div className={ cn('bg-background dark:bg-gray-800 w-64 shrink-0 p-6 overflow-hidden', leftPanelClassName) }>
        {/* 增加上边距避免与按钮重叠，或者通过内部padding调整 */ }
        <ThinkingProcess
          steps={
            renderStep.length
              ? renderStep
              : [{ done: false, markdown: '' }]
          }
          thinkDone={ thinkDone }
          staggerDelay={ 0.1 }
          className={ cn('border-none p-0 shadow-none h-full', thinkingProcessClassName) }
          onStepClick={ handleStepClick }
          activeStepIndex={ activeStepIndex }
        />
      </div>

      {/* 右侧: 模拟内容区域 */ }
      <StepContent
        thinkDone={ thinkDone }
        stepData={ renderStep }
        className={ cn(
          'h-full flex-1 grow overflow-auto border-l border-gray-200 dark:border-gray-600 dark:bg-[#0D1117] p-6',
          rightPanelClassName,
        ) }
        scrollToIndex={ activeStepIndex }
        autoScrollToBottomEnabled={ enableAutoScrollToBottom }
      />
    </div>
  )
}

ThinkingStep.displayName = 'ThinkingStep'

export interface SearchResultItem {
  title: string
  icon: string
}

export interface ThinkingStepProps {
  thinkDone?: boolean
  /**
   * 当前显示的步骤数据。
   */
  currentSteps: StepData[]
  /**
   * 动画是否正在进行中（用于禁用重播按钮）。
   */
  isAnimating?: boolean
  /**
   * 点击重播按钮时的回调函数。
   */
  onReplay?: () => void
  /**
   * 左侧面板的 ThinkingProcess 组件的 className。
   */
  thinkingProcessClassName?: string
  /**
   * 整体容器的 className。
   */
  className?: string
  /**
   * 右侧内容区域的 className。
   */
  rightPanelClassName?: string
  /**
   * 左侧面板的 className。
   */
  leftPanelClassName?: string
}
