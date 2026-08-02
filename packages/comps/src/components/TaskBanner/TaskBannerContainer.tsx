'use client'

import type { TaskBannerItemData, TaskBannerPlacement } from './types'
import { useKeyboardLayer, useLatestCallback } from 'hooks'
import { AnimatePresence } from 'motion/react'
import { memo, useState, useSyncExternalStore } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { TaskBannerBar } from './TaskBannerBar'
import { taskBannerStore } from './taskBannerStore'
import { TaskBannerPanel, TaskBannerSummaryBar } from './TaskBannerSummary'

/** 不同水平定位对应的容器类（含对齐方式），默认 'top' 与历史行为完全一致 */
const PLACEMENT_CLASS: Record<TaskBannerPlacement, string> = {
  'top': 'left-1/2 -translate-x-1/2 items-center',
  'top-left': 'left-4 items-start',
  'top-right': 'right-4 items-end',
}

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

  useKeyboardLayer({
    active: showPanel,
    keys: ['Escape'],
    priority: Z.toast,
    allowRepeat: false,
    onKeyDown: () => setExpanded(false),
  })

  /** 重试 = 该条出栈 + 交还业务重新发起（业务通常再 start 一条新的处理中彩条） */
  const handleRetry = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.onRetry?.()
  })

  /** 关闭 = 该条出栈 + 交还业务做关闭后的补充处理 */
  const handleClose = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.onClose?.()
  })

  return (
    <div
      style={ { zIndex: Z.toast, top: config.topOffset } }
      className={ cn(
        'pointer-events-none fixed flex flex-col gap-3',
        PLACEMENT_CLASS[config.placement] ?? PLACEMENT_CLASS.top,
      ) }
    >
      <AnimatePresence mode="popLayout">
        { stackItems.map(item => (
          <TaskBannerBar
            key={ item.id }
            item={ item }
            onRetry={ handleRetry }
            onClose={ handleClose }
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
            onClose={ handleClose }
            onCollapse={ () => setExpanded(false) }
          />
        ) }
      </AnimatePresence>
    </div>
  )
})

TaskBannerContainer.displayName = 'TaskBannerContainer'
