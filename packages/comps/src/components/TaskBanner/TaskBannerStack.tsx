'use client'

import type { TaskBannerConfig, TaskBannerItemData, TaskBannerPlacement } from './types'
import { useKeyboardLayer, useLatestCallback } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { getEnterMotion, isBottomPlacement } from './constants'
import { TaskBannerBar } from './TaskBannerBar'
import { taskBannerStore } from './taskBannerStore'
import { TaskBannerPanel, TaskBannerSummaryBar } from './TaskBannerSummary'

/**
 * 各定位对应的容器类（水平定位 + 对齐 + 堆叠方向）
 *
 * 底部一组用 `flex-col-reverse`：条目数组恒为「最新在前」，反向排布后
 * 最新那条落在最靠近底边的位置，与顶部「最新在上」是同一条规则
 */
const PLACEMENT_CLASS: Record<TaskBannerPlacement, string> = {
  'top': 'left-1/2 -translate-x-1/2 items-center flex-col',
  'top-left': 'left-4 items-start flex-col',
  'top-right': 'right-4 items-end flex-col',
  'bottom': 'left-1/2 -translate-x-1/2 items-center flex-col-reverse',
  'bottom-left': 'left-4 items-start flex-col-reverse',
  'bottom-right': 'right-4 items-end flex-col-reverse',
}

/**
 * 单个定位下的彩条堆叠
 *
 * 收拢阈值、展开面板都按栈各算各的：不同定位是视觉上互不相干的两摞，
 * 把左上角的失败数算进右下角的汇总条只会让人看不懂
 *
 * `renderSummary` / `renderPanel` 只接管内容，外面那层 motion.div 仍由这里出：
 * `AnimatePresence` 要靠稳定的 key 与真实 motion 子节点才能跑退场动画，
 * 把这层也交出去等于要求每个自定义渲染都自己复刻一遍进出场
 */
export const TaskBannerStack = memo<TaskBannerStackProps>((props) => {
  const { placement, items, config } = props

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

  /** 面板展开时失败条全部移入面板，堆叠区只剩非失败条；否则按提交时间渲染未折叠条目 */
  const stackItems = showPanel
    ? items.filter(item => item.status !== 'failed')
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

  /** 操作按钮 = 该条出栈 + 交还业务（如撤销一次删除） */
  const handleAction = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.action?.onClick()
  })

  /** 驻留到期 = 该条出栈 + 通知业务机会已过（如撤销窗口关闭） */
  const handleExpire = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.onExpire?.()
  })

  /** 展开 / 收起汇总面板；内置汇总条与自定义渲染共用同一对动作 */
  const expand = useLatestCallback(() => setExpanded(true))
  const collapse = useLatestCallback(() => setExpanded(false))

  /** 关闭 = 该条出栈 + 交还业务做关闭后的补充处理 */
  const handleClose = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.onClose?.()
  })

  return (
    <div
      style={ {
        zIndex: Z.toast,
        ...isBottomPlacement(placement)
          ? { bottom: config.bottomOffset }
          : { top: config.topOffset },
      } }
      className={ cn(
        'pointer-events-none fixed flex gap-3',
        PLACEMENT_CLASS[placement] ?? PLACEMENT_CLASS.top,
        config.containerClassName,
      ) }
    >
      <AnimatePresence mode="popLayout">
        { stackItems.map(item => (
          <TaskBannerBar
            key={ item.id }
            item={ item }
            placement={ placement }
            onRetry={ handleRetry }
            onAction={ handleAction }
            onExpire={ handleExpire }
            onClose={ handleClose }
          />
        )) }

        { overflow && !showPanel && (
          config.renderSummary
            ? (
                <motion.div
                  key="task-banner-summary"
                  layout
                  { ...getEnterMotion(placement) }
                  className="pointer-events-auto"
                >
                  { config.renderSummary({ count: foldedIds.size, placement, expand }) }
                </motion.div>
              )
            : (
                <TaskBannerSummaryBar
                  key="task-banner-summary"
                  placement={ placement }
                  className={ config.summaryClassName }
                  count={ foldedIds.size }
                  onExpand={ expand }
                />
              )
        ) }

        { showPanel && (
          config.renderPanel
            ? (
                <motion.div
                  key="task-banner-panel"
                  layout
                  { ...getEnterMotion(placement) }
                  className="pointer-events-auto"
                >
                  { config.renderPanel({
                    failures,
                    placement,
                    retry: handleRetry,
                    close: handleClose,
                    collapse,
                  }) }
                </motion.div>
              )
            : (
                <TaskBannerPanel
                  key="task-banner-panel"
                  placement={ placement }
                  className={ config.panelClassName }
                  failures={ failures }
                  onRetry={ handleRetry }
                  onClose={ handleClose }
                  onCollapse={ collapse }
                />
              )
        ) }
      </AnimatePresence>
    </div>
  )
})

TaskBannerStack.displayName = 'TaskBannerStack'

export type TaskBannerStackProps = {
  /** 本栈的定位 */
  placement: TaskBannerPlacement
  /** 落在本栈的条目，最新在前 */
  items: TaskBannerItemData[]
  /** 全局配置（收拢阈值与两侧偏移） */
  config: TaskBannerConfig
}
