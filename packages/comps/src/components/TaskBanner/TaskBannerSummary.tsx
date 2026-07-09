'use client'

import type { TaskBannerItemData } from './types'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'motion/react'
import { memo } from 'react'
import { useT } from '../../i18n'
import { CloseBtn } from '../CloseBtn'

/** 汇总条 / 展开面板共用的进出场动画 */
const ENTER_MOTION = {
  initial: { opacity: 0, y: -16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.96 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const

/**
 * 失败汇总彩条（收拢态）
 * 失败彩条超过阈值后，更早的失败条收拢为这一条，点击展开为面板
 */
export const TaskBannerSummaryBar = memo<TaskBannerSummaryBarProps>((props) => {
  const { count, onExpand } = props
  const t = useT()

  return (
    <motion.div
      layout
      { ...ENTER_MOTION }
      role="button"
      onClick={ onExpand }
      className="pointer-events-auto flex cursor-pointer items-center gap-3 rounded-2xl bg-background px-4 py-3 shadow-toast"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-dangerBg">
        <AlertCircle className="size-full text-danger" />
      </span>

      <span className="text-sm text-danger">{ t('taskBanner.failedSummary', { count }) }</span>

      <ChevronDown className="size-4 text-text2" />
    </motion.div>
  )
})

TaskBannerSummaryBar.displayName = 'TaskBannerSummaryBar'

/**
 * 失败列表面板（展开态）
 * 展示全部失败条目并支持逐条重试；点击头部或 Esc 收起
 */
export const TaskBannerPanel = memo<TaskBannerPanelProps>((props) => {
  const { failures, onRetry, onClose, onCollapse } = props
  const t = useT()

  return (
    <motion.div
      layout
      { ...ENTER_MOTION }
      className="pointer-events-auto w-96 overflow-hidden rounded-2xl bg-background shadow-toast"
    >
      <div
        role="button"
        onClick={ onCollapse }
        className="flex cursor-pointer items-center justify-between border-b border-border px-4 py-3"
      >
        <span className="text-sm font-medium text-danger">
          { t('taskBanner.failedSummary', { count: failures.length }) }
        </span>
        <ChevronUp className="size-4 text-text2" />
      </div>

      <div className="max-h-80 overflow-y-auto py-1">
        { failures.map(item => (
          <div
            key={ item.id }
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <span className="min-w-0 truncate text-sm text-danger">
              { item.reason ?? t('taskBanner.failed') }
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="text-sm font-medium text-info hover:underline"
                onClick={ () => onRetry(item) }
              >
                { t('taskBanner.retry') }
              </button>

              { item.showClose && (
                <CloseBtn
                  { ...item.closeBtnProps }
                  mode="static"
                  size={ item.closeBtnProps?.size ?? 20 }
                  onClick={ () => onClose(item) }
                />
              ) }
            </div>
          </div>
        )) }
      </div>
    </motion.div>
  )
})

TaskBannerPanel.displayName = 'TaskBannerPanel'

export type TaskBannerSummaryBarProps = {
  /** 收拢进汇总条的失败条数 */
  count: number
  /** 点击展开为失败列表面板 */
  onExpand: () => void
}

export type TaskBannerPanelProps = {
  /** 全部失败条目（最新在前） */
  failures: TaskBannerItemData[]
  /** 点击重试：由容器负责出栈 + 触发 item.onRetry */
  onRetry: (item: TaskBannerItemData) => void
  /** 点击关闭：由容器负责出栈 + 触发 item.onClose */
  onClose: (item: TaskBannerItemData) => void
  /** 收起面板 */
  onCollapse: () => void
}
