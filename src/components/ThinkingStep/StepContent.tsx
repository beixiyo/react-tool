'use client'

import type { StepData } from './types'
import { useTheme } from '@/hooks'
import { cn } from '@/utils'
import { memo, useEffect, useRef } from 'react'
import { AutoScrollAnimate } from '../AutoScrollAnimate'
import { MdToHtml } from '../MdEditor/MdToHtml'

export const StepContent = memo<StepContentProps>((
  {
    style,
    className,
    thinkDone,
    stepData,
    scrollToIndex,
    autoScrollToBottomEnabled,
  },
) => {
  const [theme] = useTheme()
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  /** 确保 itemRefs 数组与 stepData 同步 */
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, stepData.length)
  }, [stepData.length])

  /** 滚动到指定的步骤索引 */
  useEffect(() => {
    if (scrollToIndex != undefined && itemRefs.current[scrollToIndex]) {
      itemRefs.current[scrollToIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [scrollToIndex])

  return <AutoScrollAnimate
    smooth
    // updateBy={ stepData }
    fadeInMaskHeight={ 100 }
    fadeInMask={ !thinkDone }
    fadeInColor={ theme === 'dark'
      ? '#1f2937'
      : '#ffffff' }
    autoScroll={ autoScrollToBottomEnabled }
    className={ cn(
      'StepContentContainer',
      className,
    ) }
    style={ style }
  >
    { stepData.map((step, index) => <div
      key={ step.id ?? `step-content-${index}` }
      ref={ el => (itemRefs.current[index] = el) } // 分配 ref
      className=""
    >
      <MdToHtml content={ step.markdown } />
      <div dangerouslySetInnerHTML={ { __html: '<div class="h-10"></div>' } }></div>

      {/* 显示搜索结果 */ }
      { step.searchResults && (
        <div className="mt-4 space-y-3">
          { step.searchResults.map(result => (
            <div key={ `${step.id || index}-search-${result.title}-${result.icon}` } className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <span className="text-base">{ result.icon }</span>
              <span>{ result.title }</span>
            </div>
          )) }
        </div>
      ) }
    </div>,
    ) }
  </AutoScrollAnimate>
})

StepContent.displayName = 'StepContent'

export type StepContentProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  stepData: StepData[]
  thinkDone?: boolean
  /**
   * 需要滚动到的步骤索引。
   */
  scrollToIndex?: number
  /**
   * 是否启用自动滚动到底部。
   */
  autoScrollToBottomEnabled?: boolean
}
