'use client'

import { useLatestCallback } from 'hooks'
import { motion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { MessageView } from '../Message/MessageView'
import { getEnterMotion } from './constants'
import type { TaskBannerItemData, TaskBannerPlacement } from './types'

/** 操作按钮（重试 / notice 的 action）的基础样式，业务的 actionClassName 追加其后 */
const ACTION_CLASS = 'shrink-0 font-medium text-info hover:underline'

/**
 * 单条任务彩条（视觉复用 MessageView，与 Message 保持一致质感）
 *
 * - pending：info 底色、无图标，内容完全由业务传入（如渐变 loading 文字）
 * - failed：danger 语义图标 + 左侧失败原因 + 右侧重试按钮；
 *   默认不显示关闭按钮，显式 showClose 后可手动关闭
 * - notice：业务文案 + 可选操作按钮（如「撤销」），到时自动出栈
 *
 * 三档定制见 `TaskBannerAppearance`；给了 `render` 就整条交给业务画，
 * 这里只保留动画层与计时
 *
 * 文案（重试 / 缺省失败）走组件库 i18n（taskBanner 命名空间），随全局语言切换；
 * notice 的文案与按钮全部由业务给，组件库不猜语义
 */
export const TaskBannerBar = memo<TaskBannerBarProps>((props) => {
  const { item, placement, onRetry, onAction, onClose, managedLayout = false, stackCount, stackProgress, countClassName } = props
  const t = useT()
  const motionProps = item.motionProps
  const enterMotion = getEnterMotion(placement)
  const neutralSurface = item.status === 'pending' || (item.status === 'notice' && (!item.variant || item.variant === 'default' || item.variant === 'neutral'))
  const cardClassName = cn(
    'min-h-12 items-center gap-2 rounded-3xl py-2.5 pl-3 pr-4 shadow-toast',
    neutralSurface && 'bg-button3',
    stackCount != null && 'pr-11',
    item.className,
  )
  const contentClassName = cn('min-w-0 font-normal leading-5', item.contentClassName)

  /** 三处内置按钮与自定义渲染共用同一组动作，保证「先出栈再回调」的时序只有一份 */
  const retry = useLatestCallback(() => onRetry(item))
  const runAction = useLatestCallback(() => onAction(item))
  const close = useLatestCallback(() => onClose(item))

  return (
    <motion.div
      { ...motionProps }
      layout={ managedLayout
        ? false
        : motionProps?.layout ?? true }
      initial={ motionProps?.initial ?? enterMotion.initial }
      animate={ motionProps?.animate ?? enterMotion.animate }
      exit={ motionProps?.exit ?? enterMotion.exit }
      transition={ motionProps?.transition ?? enterMotion.transition }
      /** 合并而非覆盖：拿掉 pointer-events-auto 整条就点不动了 */
      className={ cn('pointer-events-auto relative', motionProps?.className) }
    >
      { item.render
        ? item.render({ item, placement, retry, runAction, close })
        : (
          <>
            { item.status === 'pending' && (
              <MessageView
                variant="info"
                showIcon={ false }
                showClose={ item.showClose }
                closeBtnProps={ item.closeBtnProps }
                onClose={ close }
                className={ cardClassName }
                contentClassName={ contentClassName }
                content={ item.content }
              />
            ) }

            { item.status === 'failed' && (
              <MessageView
                variant="error"
                showClose={ item.showClose }
                closeBtnProps={ item.closeBtnProps }
                onClose={ close }
                className={ cardClassName }
                contentClassName={ contentClassName }
                content={ 
                  <span className="flex items-center gap-3">
                    <span>{ item.reason ?? t('taskBanner.failed') }</span>
                    <button
                      type="button"
                      className={ cn(ACTION_CLASS, item.actionClassName) }
                      onClick={ retry }
                    >
                      { t('taskBanner.retry') }
                    </button>
                  </span>
                 }
              />
            ) }

            { item.status === 'notice' && (
              <MessageView
                variant={ item.variant ?? 'default' }
                showIcon={ item.showIcon }
                showClose={ item.showClose }
                closeBtnProps={ item.closeBtnProps }
                onClose={ close }
                className={ cardClassName }
                contentClassName={ contentClassName }
                content={ 
                  <span className="flex items-center gap-3">
                    <span>{ item.content }</span>

                    { item.action?.text != null && (
                      <button
                        type="button"
                        className={ cn(ACTION_CLASS, item.actionClassName) }
                        onClick={ runAction }
                      >
                        { item.action.text }
                      </button>
                    ) }
                  </span>
                 }
              />
            ) }
            { stackCount != null && (
              <motion.span
                aria-hidden
                className={ cn(
                  'pointer-events-none absolute right-4 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-text/50 px-1 text-xs font-medium leading-none text-textSpecial',
                  countClassName,
                ) }
                style={ { opacity: stackProgress } }
              >
                { stackCount }
              </motion.span>
            ) }
          </>
        ) }
    </motion.div>
  )
})

TaskBannerBar.displayName = 'TaskBannerBar'

export type TaskBannerBarProps = {
  item: TaskBannerItemData
  /** 内部列表已管理位置，避免 layout 投影与共享收拢时间轴叠加。@default false */
  managedLayout?: boolean
  /** 内置顶卡的任务数；有值时始终预留徽标槽，反向动画不改变宽度。 */
  stackCount?: number
  /** 收拢时间轴，用于连续显示数量徽标。 */
  stackProgress?: MotionValue<number>
  /** 数量徽标的样式覆盖。 */
  countClassName?: string
  /** 本条所在栈的定位，决定进出场位移方向 */
  placement: TaskBannerPlacement
  /** 点击重试：由容器负责出栈 + 触发 item.onRetry */
  onRetry: (item: TaskBannerItemData) => void
  /** 点击 notice 的操作按钮：由容器负责出栈 + 触发 item.action.onClick */
  onAction: (item: TaskBannerItemData) => void
  /** 点击关闭：由容器负责出栈 + 触发 item.onClose */
  onClose: (item: TaskBannerItemData) => void
}
