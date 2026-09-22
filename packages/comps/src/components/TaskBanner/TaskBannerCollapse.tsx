'use client'

/** 展开列表末端的收起入口；真实卡片由 TaskBannerList 持有，不在这里复制 */
import { useTheme } from 'hooks'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'motion/react'
import { memo } from 'react'
import { useT } from '../../i18n'
import { getEnterMotion, isBottomPlacement } from './constants'
import type { TaskBannerPlacement } from './types'

/** 箭头指向锚定边：顶部向上收，底部向下收。 */
export const TaskBannerCollapseChip = memo<TaskBannerCollapseChipProps>((props) => {
  const { placement, onClick } = props
  const t = useT()
  const [theme] = useTheme()

  const Chevron = isBottomPlacement(placement)
    ? ChevronDown
    : ChevronUp
  /** 浅色模式仅用阴影，深色模式才显示边框 */
  const chrome = theme === 'dark'
    ? 'border border-border'
    : 'shadow-xs'

  return (
    <motion.div layout { ...getEnterMotion(placement) } className="pointer-events-auto">
      <button
        type="button"
        aria-label={ t('taskBanner.collapse') }
        onClick={ onClick }
        className={ `flex size-6 items-center justify-center rounded-full bg-background text-text2 transition-colors hover:text-text ${chrome}` }
      >
        <Chevron className="size-4" />
      </button>
    </motion.div>
  )
})

TaskBannerCollapseChip.displayName = 'TaskBannerCollapseChip'

/** 展开态的末端收起入口。 */
export type TaskBannerCollapseChipProps = {
  /** 所在栈的定位，决定箭头方向与进出场位移 */
  placement: TaskBannerPlacement
  /** 折回层叠卡片 */
  onClick: () => void
}
