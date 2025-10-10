import { motion } from 'framer-motion'
import { CircleEllipsis } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Checkmark } from '../Checkbox'

export const ThinkingStepItem = memo<ThinkingStepItemProps>(({
  thinkDoneText = 'Think Done',
  thinkingText = 'Thinking',
  done = false,
  isLast = false,
  className,
  onClick,
  isActive,
  index,
}: ThinkingStepItemProps) => {
  const thinkText = done
    ? thinkDoneText || 'Think Done'
    : thinkingText || 'Thinking'

  const Icon = done
    ? Checkmark
    : CircleEllipsis

  const iconAttrs = done
    ? {
        color: '#fff',
        fill: '#000',
        size: 23,
        className: 'absolute left-0 top-0',
      }
    : {
        size: 19,
        className: 'absolute left-[2px] top-[2px]',
      }

  /** 每个步骤项的动画变体 */
  const stepVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring', // 使用弹簧动画增加自然感
        stiffness: 300,
        damping: 20,
      },
    },
  }

  return (
    <motion.div
      className={ cn(
        'relative pl-8 cursor-pointer transition-all duration-300', // 添加 cursor-pointer
        { 'bg-gray-200 dark:bg-gray-600 rounded-md': isActive }, // 高亮活动项的样式
        className,
      ) }
      variants={ stepVariants }
      onClick={ () => onClick?.(index) }
    >
      {/* 图标和文本容器 */ }
      <div className={ cn(
        'flex items-center min-h-6',
        !isLast && 'mb-4',
      ) }>
        {/* 增加一些底部外边距 */ }
        <Icon
          { ...iconAttrs }
        />

        <span
          title={ thinkText }
          className={ cn(
            'text-sm text-gray-700 dark:text-gray-300 truncate',
            !done && 'loadingText',
          ) }>
          { thinkText }
        </span>
      </div>

      {/* 连接线 (仅在不是最后一项时显示) */ }
      { !isLast && (
        <motion.div
          className="absolute bottom-0 left-[10px] top-6 w-[2px] bg-gray-300 dark:bg-gray-500" // 定位线条
          initial={ { height: 0 } }
          animate={ { height: 'calc(100% - .5rem)' } } // 平滑地动画化高度 (总高度减去图标和间距)
          transition={ { duration: 0.3, ease: 'easeOut' } } // 控制线条动画速度和缓动
        />
      ) }
    </motion.div>
  )
})

ThinkingStepItem.displayName = 'ThinkingStepItem'

export interface ThinkingStepItemProps {
  /**
   * 思考完毕的文本
   * @default 'Think Done'
   */
  thinkDoneText?: string
  /**
   * 思考中的文本
   * @default 'Thinking'
   */
  thinkingText?: string
  /**
   * 步骤是否已完成
   * @default false
   */
  done?: boolean
  /**
   * 步骤的索引，用于动画 key 和潜在的样式。由父组件传入。
   */
  index: number
  /**
   * 指示这是否是列表中的最后一步，用于隐藏连接线。由父组件传入。
   * @default false
   */
  isLast?: boolean
  /**
   * 列表项元素的额外 CSS 类。
   */
  className?: string
  /**
   * 点击步骤项时的回调函数。
   */
  onClick?: (index: number) => void
  /**
   * 指示该步骤项是否为当前活动项。
   * @default false
   */
  isActive?: boolean
}
