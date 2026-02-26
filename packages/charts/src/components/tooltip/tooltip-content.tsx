'use client'

import type { TooltipContentProps } from './types'
import { motion } from 'motion/react'
import { memo, useEffect, useRef, useState } from 'react'
import useMeasure from 'react-use-measure'

function TooltipContentInner({
  title,
  rows = [],
  children,
}: TooltipContentProps) {
  const [measureRef, bounds] = useMeasure({ debounce: 0, scroll: false })
  const [committedHeight, setCommittedHeight] = useState<number | null>(null)
  /** 记录「已经提交的 children 是否存在」，而不是当前传入的 children 状态 */
  const committedChildrenStateRef = useRef<boolean | null>(null)
  const frameRef = useRef<number | null>(null)

  const hasChildren = !!children

  /**
   * 检查我们是否正在等待结构变化稳定
   * 当 children 状态与我们上次提交的状态不同时，此值为 true
   */
  const isWaitingForSettlement
    = committedChildrenStateRef.current !== null
      && committedChildrenStateRef.current !== hasChildren

  /** 结构更改时，以帧延迟提交高度更改 */
  useEffect(() => {
    if (bounds.height <= 0) {
      return
    }

    /** 取消任何待处理的帧 */
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    if (isWaitingForSettlement) {
      /** 结构已更改 - 在提交之前等待布局稳定 */
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = requestAnimationFrame(() => {
          setCommittedHeight(bounds.height)
          committedChildrenStateRef.current = hasChildren
        })
      })
    }
    else {
      /** 无结构更改，立即提交 */
      setCommittedHeight(bounds.height)
      committedChildrenStateRef.current = hasChildren
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [bounds.height, hasChildren, isWaitingForSettlement])

  /** 如果我们有提交的高度，则进行动画 */
  const shouldAnimate = committedHeight !== null

  return (
    <motion.div
      /** 仅当我们有提交的高度时才动画，否则使用 auto */
      animate={
        committedHeight !== null
          ? { height: committedHeight }
          : undefined
      }
      className="overflow-hidden"
      /** 跳过初始动画 */
      initial={ false }
      /** 当我们有提交的高度时应用弹簧过渡 */
      transition={
        shouldAnimate
          ? {
              type: 'spring',
              stiffness: 500,
              damping: 35,
              mass: 0.8,
            }
          : { duration: 0 }
      }
    >
      <div className="px-3 py-2.5" ref={ measureRef }>
        { title && (
          <div className="mb-2 font-medium text-text text-xs">
            { title }
          </div>
        ) }

        <div className="space-y-1.5">
          { rows.map(row => (
            <div
              className="flex items-center justify-between gap-4"
              key={ `${row.label}-${row.color}` }
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={ { backgroundColor: row.color } }
                />
                <span className="text-text2 text-sm">
                  { row.label }
                </span>
              </div>
              <span className="font-medium text-text text-sm tabular-nums">
                { typeof row.value === 'number'
                  ? row.value.toLocaleString()
                  : row.value }
              </span>
            </div>
          )) }
        </div>
      </div>
    </motion.div>
  )
}

export const TooltipContent = memo(TooltipContentInner)

TooltipContent.displayName = 'TooltipContent'
