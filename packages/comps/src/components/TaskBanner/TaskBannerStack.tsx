'use client'

import { useKeyboardLayer, useLatestCallback } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { getEnterMotion, isBottomPlacement, TASK_BANNER_DEFAULT_COLLAPSE_THRESHOLD } from './constants'
import { TaskBannerBar } from './TaskBannerBar'
import { TaskBannerCollapseChip } from './TaskBannerCollapse'
import { TaskBannerList } from './TaskBannerList'
import { taskBannerStore } from './taskBannerStore'
import { TaskBannerPanel, TaskBannerSummaryBar } from './TaskBannerSummary'
import type { TaskBannerConfig, TaskBannerItemData, TaskBannerPlacement } from './types'

/**
 * 各定位对应的容器类（水平定位 + 对齐 + 堆叠方向）
 *
 * 底部一组用 `flex-col-reverse`：条目数组恒为「最新在前」，反向排布后
 * 最新那条落在最靠近底边的位置，与顶部「最新在上」是同一条规则
 */
const PLACEMENT_CLASS: Record<TaskBannerPlacement, string> = {
  top: 'left-1/2 -translate-x-1/2 items-center flex-col',
  'top-left': 'left-4 items-start flex-col',
  'top-right': 'right-4 items-end flex-col',
  bottom: 'left-1/2 -translate-x-1/2 items-center flex-col-reverse',
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
   * 失败面板展开态。失败数回落到阈值内时该值不再生效（直接渲染独立彩条），
   * 故无需手动复位；再次溢出时直接回到展开态，延续用户上次的查看状态
   */
  const [expanded, setExpanded] = useState(false)

  /**
   * 整摞收拢的展开态。条目数回落到阈值内时该值不再生效（收拢态本就不渲染），
   * 再次达标则延续用户上次的查看状态；条目增减不主动复位，交给用户控制
   */
  const [stackExpanded, setStackExpanded] = useState(false)

  const failures = items.filter((item) => item.status === 'failed')
  const overflow = failures.length > config.maxVisibleFailures
  const showPanel = expanded && overflow

  /** 收拢进汇总条的失败彩条：保留最新 N 条单独展示，更早的折叠（PRD「第 4 条及之后收拢」） */
  const foldedIds = new Set(failures.slice(config.maxVisibleFailures).map((item) => item.id))

  /** 面板展开时失败条全部移入面板，堆叠区只剩非失败条；否则按提交时间渲染未折叠条目 */
  const stackItems = showPanel
    ? items.filter((item) => item.status !== 'failed')
    : items.filter((item) => !foldedIds.has(item.id))

  /**
   * 整摞收拢（默认关闭）：可见条目数达到阈值即把整摞收成层叠卡片，
   * 最新一条作顶层、更早的作底部露边层（最多 3 层）；收拢时失败汇总条 /
   * 面板一并折进去，展开后两层收拢机制照常各自生效
   */
  const collapseConfig = config.collapse
  const collapseLayerLimit = collapseConfig?.stackedCards?.layers ?? 3
  const collapseActive = !!collapseConfig && stackItems.length >= (collapseConfig.threshold ?? TASK_BANNER_DEFAULT_COLLAPSE_THRESHOLD)
  const showStackCollapse = collapseActive && !stackExpanded
  const showCollapseChip = collapseActive && stackExpanded
  /** 进入层叠的条目（最新在前）；条目不足时不补空层，避免凭空多出边框 / 阴影 */
  const collapseItems = stackItems.slice(0, collapseLayerLimit)

  /**
   * Esc 的目标：面板 / 整摞展开时先收它们；否则关掉堆叠区里最新的一条可关彩条
   *
   * `stackItems` 恒为最新在前，取第一条满足条件的即可；整摞收拢时只有进层的条目
   * 可见，被藏进层后的条子不该被键盘关掉。处理中的任务永远不是目标
   */
  const escPool = showStackCollapse
    ? collapseItems
    : stackItems
  const escTarget = escPool.find((item) => item.status !== 'pending' && item.escToClose) ?? null

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

  /** 展开 / 收起汇总面板；内置汇总条与自定义渲染共用同一对动作 */
  const expand = useLatestCallback(() => setExpanded(true))
  const collapse = useLatestCallback(() => setExpanded(false))

  /** 展开 / 折回整摞收拢；内置收拢态与自定义渲染共用同一对动作 */
  const expandStack = useLatestCallback(() => setStackExpanded(true))
  const collapseStack = useLatestCallback(() => setStackExpanded(false))

  /** 关闭 = 该条出栈 + 交还业务做关闭后的补充处理 */
  const handleClose = useLatestCallback((item: TaskBannerItemData) => {
    taskBannerStore.remove(item.id)
    item.onClose?.()
  })

  /**
   * Esc：失败面板先收，展开的整摞次之，最后关 `escTarget`，与点 ✕ 同一条路径
   *
   * 与 Modal / Popover 共用同一个键盘层栈，优先级取本容器真实的 z-index（`Z.toast`），
   * 于是「一次 Esc 只关视觉上最上面那一层」自然成立：彩条压在弹窗之上，
   * 第一下 Esc 关彩条，第二下才轮到弹窗；彩条不在场时这层不注册，Esc 原样落到弹窗
   */
  useKeyboardLayer({
    active: showPanel || showCollapseChip || escTarget !== null,
    keys: ['Escape'],
    priority: Z.toast,
    allowRepeat: false,
    onKeyDown: () => {
      if (showPanel) {
        collapse()
        return
      }
      if (showCollapseChip) {
        collapseStack()
        return
      }
      if (escTarget) handleClose(escTarget)
    },
  })

  return (
    <div
      style={ {
        zIndex: Z.toast,
        ...(isBottomPlacement(placement)
          ? { bottom: config.bottomOffset }
          : { top: config.topOffset }),
      } }
      className={ cn('pointer-events-none fixed flex gap-3', PLACEMENT_CLASS[placement] ?? PLACEMENT_CLASS.top, config.containerClassName) }
    >
      { /* 配置切换时直接交接两种布局，避免旧模式的退场副本与新模式同时存在 */ }
      <AnimatePresence
        key={ collapseConfig
          ? 'collapsible'
          : 'flow' }
        mode="popLayout"
      >
        {
          /* 未启用整摞收拢时保留普通流式布局，新增 / 移除卡片由 Motion layout 平滑重排
             分支只取决于配置是否启用，不能按收起 / 展开态切换，否则会丢失真实卡片 DOM */
        }
        { collapseConfig
          ? (
            <TaskBannerList
              key="task-banner-list"
              items={ stackItems }
              placement={ placement }
              collapsed={ showStackCollapse }
              config={ collapseConfig }
              containerClassName={ config.containerClassName }
              expand={ expandStack }
              onRetry={ handleRetry }
              onAction={ handleAction }
              onClose={ handleClose }
            />
          )
          : stackItems.map((item) => (
            <TaskBannerBar
              key={ item.id }
              item={ item }
              placement={ placement }
              onRetry={ handleRetry }
              onAction={ handleAction }
              onClose={ handleClose }
            />
          )) }

        { showCollapseChip && <TaskBannerCollapseChip key="task-banner-collapse-chip" placement={ placement } onClick={ collapseStack } /> }

        { !showStackCollapse
          && overflow
          && !showPanel
          && (config.renderSummary
            ? (
              <motion.div key="task-banner-summary" layout { ...getEnterMotion(placement) } className="pointer-events-auto">
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
            )) }

        { !showStackCollapse
          && showPanel
          && (config.renderPanel
            ? (
              <motion.div key="task-banner-panel" layout { ...getEnterMotion(placement) } className="pointer-events-auto">
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
            )) }
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
