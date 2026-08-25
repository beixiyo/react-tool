'use client'

import type { TaskBannerItemData, TaskBannerPlacement } from './types'
import { useLatestCallback } from 'hooks'
import { motion } from 'motion/react'
import { memo, useEffect } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { MessageView } from '../Message/MessageView'
import { getEnterMotion } from './constants'

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
  const { item, placement, onRetry, onAction, onExpire, onClose } = props
  const t = useT()
  const motionProps = item.motionProps
  const enterMotion = getEnterMotion(placement)

  const expire = useLatestCallback(() => onExpire(item))

  /**
   * notice 的驻留计时
   *
   * 放在渲染层而不是 store：计时本质上跟着「这条在场」这件事走，
   * 组件卸载（容器被拆、条目被别的路径移除）时 effect 清理顺带把计时器带走，
   * store 里自己管则要额外维护一张 id → timer 表并在每条移除路径上记得清
   *
   * `duration` 已在 store 归一化，这里只判 `> 0`（0 即常驻，交给业务关闭）
   */
  useEffect(() => {
    if (item.status !== 'notice') {
      return
    }

    const duration = item.duration ?? 0
    if (duration <= 0) {
      return
    }

    const timer = setTimeout(expire, duration)
    return () => clearTimeout(timer)
  }, [item.status, item.duration])

  /** 三处内置按钮与自定义渲染共用同一组动作，保证「先出栈再回调」的时序只有一份 */
  const retry = useLatestCallback(() => onRetry(item))
  const runAction = useLatestCallback(() => onAction(item))
  const close = useLatestCallback(() => onClose(item))

  return (
    <motion.div
      { ...motionProps }
      layout={ motionProps?.layout ?? true }
      initial={ motionProps?.initial ?? enterMotion.initial }
      animate={ motionProps?.animate ?? enterMotion.animate }
      exit={ motionProps?.exit ?? enterMotion.exit }
      transition={ motionProps?.transition ?? enterMotion.transition }
      /** 合并而非覆盖：拿掉 pointer-events-auto 整条就点不动了 */
      className={ cn('pointer-events-auto', motionProps?.className) }
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
                  className={ item.className }
                  contentClassName={ item.contentClassName }
                  content={ item.content }
                />
              ) }

              { item.status === 'failed' && (
                <MessageView
                  variant="error"
                  showClose={ item.showClose }
                  closeBtnProps={ item.closeBtnProps }
                  onClose={ close }
                  className={ item.className }
                  contentClassName={ item.contentClassName }
                  content={ (
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
                  ) }
                />
              ) }

              { item.status === 'notice' && (
                <MessageView
                  variant={ item.variant ?? 'default' }
                  showIcon={ item.showIcon }
                  showClose={ item.showClose }
                  closeBtnProps={ item.closeBtnProps }
                  onClose={ close }
                  className={ item.className }
                  contentClassName={ item.contentClassName }
                  content={ (
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
                  ) }
                />
              ) }
            </>
          ) }
    </motion.div>
  )
})

TaskBannerBar.displayName = 'TaskBannerBar'

export type TaskBannerBarProps = {
  item: TaskBannerItemData
  /** 本条所在栈的定位，决定进出场位移方向 */
  placement: TaskBannerPlacement
  /** 点击重试：由容器负责出栈 + 触发 item.onRetry */
  onRetry: (item: TaskBannerItemData) => void
  /** 点击 notice 的操作按钮：由容器负责出栈 + 触发 item.action.onClick */
  onAction: (item: TaskBannerItemData) => void
  /** notice 驻留到期：由容器负责出栈 + 触发 item.onExpire */
  onExpire: (item: TaskBannerItemData) => void
  /** 点击关闭：由容器负责出栈 + 触发 item.onClose */
  onClose: (item: TaskBannerItemData) => void
}
