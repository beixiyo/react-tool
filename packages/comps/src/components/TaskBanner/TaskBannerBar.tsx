'use client'

import type { TaskBannerItemData } from './types'
import { motion } from 'motion/react'
import { memo } from 'react'
import { useT } from '../../i18n'
import { MessageView } from '../Message/MessageView'

/**
 * 单条任务彩条（视觉复用 MessageView，与 Message 保持一致质感）
 *
 * - pending：info 底色、无图标，内容完全由业务传入（如渐变 loading 文字）
 * - failed：danger 语义图标 + 左侧失败原因 + 右侧重试按钮；
 *   默认不显示关闭按钮，显式 showClose 后可手动关闭
 *
 * 文案走组件库 i18n（taskBanner 命名空间），随全局语言切换
 */
export const TaskBannerBar = memo<TaskBannerBarProps>((props) => {
  const { item, onRetry, onClose } = props
  const t = useT()
  const motionProps = item.motionProps

  return (
    <motion.div
      { ...motionProps }
      layout={ motionProps?.layout ?? true }
      initial={ motionProps?.initial ?? { opacity: 0, y: -16, scale: 0.96 } }
      animate={ motionProps?.animate ?? { opacity: 1, y: 0, scale: 1 } }
      exit={ motionProps?.exit ?? { opacity: 0, y: -12, scale: 0.96 } }
      transition={ motionProps?.transition ?? { duration: 0.3, ease: 'easeOut' } }
      className="pointer-events-auto"
    >
      { item.status === 'pending'
        ? (
            <MessageView
              variant="info"
              showIcon={ false }
              showClose={ item.showClose }
              closeBtnProps={ item.closeBtnProps }
              onClose={ () => onClose(item) }
              content={ item.content }
            />
          )
        : (
            <MessageView
              variant="error"
              showClose={ item.showClose }
              closeBtnProps={ item.closeBtnProps }
              onClose={ () => onClose(item) }
              content={ (
                <span className="flex items-center gap-3">
                  <span>{ item.reason ?? t('taskBanner.failed') }</span>
                  <button
                    type="button"
                    className="shrink-0 font-medium text-info hover:underline"
                    onClick={ () => onRetry(item) }
                  >
                    { t('taskBanner.retry') }
                  </button>
                </span>
              ) }
            />
          ) }
    </motion.div>
  )
})

TaskBannerBar.displayName = 'TaskBannerBar'

export type TaskBannerBarProps = {
  item: TaskBannerItemData
  /** 点击重试：由容器负责出栈 + 触发 item.onRetry */
  onRetry: (item: TaskBannerItemData) => void
  /** 点击关闭：由容器负责出栈 + 触发 item.onClose */
  onClose: (item: TaskBannerItemData) => void
}
