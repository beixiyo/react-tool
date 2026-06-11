'use client'

import type { TaskBannerItemData } from './types'
import { useBindWinEvent, useLatestCallback } from 'hooks'
import { AnimatePresence } from 'motion/react'
import { memo, useState, useSyncExternalStore } from 'react'
import { Z } from '../../constants/z-index'
import { TaskBannerBar } from './TaskBannerBar'
import { taskBannerStore } from './taskBannerStore'
import { TaskBannerPanel, TaskBannerSummaryBar } from './TaskBannerSummary'

/**
 * 全局唯一的任务彩条堆叠容器（首次命令式调用时挂载一次）
 *
 * 与 MessageContainer 的关键差异：
 * - 自顶向下按提交时间排列，**最新在上**（store 头插保证）
 * - 失败彩条超过 maxVisibleFailures 后，更早的失败条收拢为一条汇总彩条；
 *   点击汇总彩条展开为面板，列出**全部**失败条目逐条重试
 * - 处理中彩条短暂存在、不计入收拢
 *
 * 容器本身不拦截鼠标事件，仅每条彩条可交互
 */
export const TaskBannerContainer = memo(() => {
  const items = useSyncExternalStore(
    taskBannerStore.subscribe,
    taskBannerStore.getSnapshot,
    taskBannerStore.getSnapshot,
  )
  const config = useSyncExternalStore(
    taskBannerStore.subscribe,
    taskBannerStore.getConfig,
    taskBannerStore.getConfig,
  )

  /**
   * 面板展开态。失败数回落到阈值内时该值不再生效（直接渲染独立彩条），
   * 故无需手动复位；再次溢出时直接回到展开态，延续用户上次的查看状态
   */
  const [expanded, setExpanded] = useState(false)

  const failures = items.filter(item => item.status === 'failed')
  const overflow = failures.length > config.maxVisibleFailures
  const showPanel = expanded && overflow

  /** 收拢进汇总条的失败彩条：保留最新 N 条单独展示，更早的折叠（PRD「第 4 条及之后收拢」） */
  const foldedIds = new Set(
    failures
      .slice(config.maxVisibleFailures)
      .map(item => item.id),
  )

  /** 面板展开时失败条全部移入面板，堆叠区只剩处理中条；否则按提交时间渲染未折叠条目 */
  const stackItems = showPanel
    ? items.filter(item => item.status === 'pending')
    : items.filter(item => !foldedIds.has(item.id))

  useBindWinEvent({
    eventName: 'keydown',
    listener: (e) => {
      if (showPanel && e.key === 'Escape') {
        setExpanded(false)
      }
    },
    deps: [showPanel],
  })

  /** 重试 = 该条出栈 + 交还业务重新发起（业务通常再 start 一条新的处理中彩条） */
  const handleRetry = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.onRetry?.()
  })

  return (
    <div
      style={ { zIndex: Z.toast, top: config.topOffset } }
      className="pointer-events-none fixed left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
    >
      <AnimatePresence mode="popLayout">
        { stackItems.map(item => (
          <TaskBannerBar
            key={ item.id }
            item={ item }
            onRetry={ handleRetry }
          />
        )) }

        { overflow && !showPanel && (
          <TaskBannerSummaryBar
            key="task-banner-summary"
            count={ foldedIds.size }
            onExpand={ () => setExpanded(true) }
          />
        ) }

        { showPanel && (
          <TaskBannerPanel
            key="task-banner-panel"
            failures={ failures }
            onRetry={ handleRetry }
            onCollapse={ () => setExpanded(false) }
          />
        ) }
      </AnimatePresence>
    </div>
  )
})

TaskBannerContainer.displayName = 'TaskBannerContainer'
