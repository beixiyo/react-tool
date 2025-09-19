import type { MotionProps } from 'framer-motion'
import type { AgentTask, TaskAction } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Button } from '@/components/Button'

import { GlowBorder } from '@/components/Card/GlowBorder'
import { ProgressBar } from '@/components/Progress'
import { getStatusConfig } from '../config'

export const AgentTaskItem = memo<AgentTaskItemProps>(({
  task,
  className,
  style,
  onTaskClick,
  onActionClick,
  defaultCollapsed = false,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    task.defaultCollapsed ?? defaultCollapsed,
  )
  const statusConfig = getStatusConfig(task.status)
  const collapsible = task.collapsible !== false

  const handleTaskClick = () => {
    onTaskClick?.(task)
  }

  const handleActionClick = (action: TaskAction) => {
    if (!action.disabled) {
      onActionClick?.(task, action.key)
    }
  }

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  const hasContent = task.description
    || (typeof task.progress === 'number' && task.status === 'in-progress')
    || (task.actions && task.actions.length > 0)

  /** 是否显示发光边框 */
  const showGlowBorder = task.status === 'in-progress'

  /** 任务卡片内容 */
  const taskContent = (
    <div
      className={ cn(
        'AgentTaskItemContainer',
        'bg-white dark:bg-gray-800 rounded-2xl shadow-xs overflow-hidden',
        /** 当有发光边框时，移除默认边框，否则保留 */
        !showGlowBorder && 'border border-gray-200 dark:border-gray-700',
        'transition-all duration-200 hover:shadow-md',
        /** 当有发光边框时，调整 hover 效果 */
        !showGlowBorder && 'hover:border-gray-300 dark:hover:border-gray-600',
        onTaskClick && 'cursor-pointer',
        className,
      ) }
      style={ style }
      onClick={ onTaskClick
        ? handleTaskClick
        : undefined }
      { ...props }
    >
      {/* 头部区域 */ }
      <div className="p-4">
        {/* 头像、标题、状态一行显示，在窄屏幕下自动换行 */ }
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex grow items-center">
            {/* 头像/状态图标 */ }
            <div className={ cn(
              'w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0',
              'border transition-colors duration-200',
              statusConfig.className,
            ) }>
              { task.avatar
                ? (
                    <img
                      src={ task.avatar }
                      alt={ task.title }
                      className="size-full rounded-full object-cover"
                    />
                  )
                : (
                    <statusConfig.icon className={ cn('w-5 h-5') } />
                  ) }
            </div>

            {/* 标题区域 */ }
            <div className="min-w-0 flex-1">
              <h3 className="text-sm text-gray-900 font-medium leading-tight dark:text-gray-100">
                { task.title }
              </h3>

              {/* 进度条 - 在标题下方 */ }
              { typeof task.progress === 'number' && task.status === 'in-progress' && (
                <div className="mt-1">
                  <ProgressBar
                    value={ task.progress / 100 }
                    colors={ ['#D89FFF', '#A7AFFF', '#5AC8FF', '#3AD2FF'] }
                    animationDuration={ 0.8 }
                    animationEase="easeOut"
                  />
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      { task.progress }
                      %
                    </span>
                  </div>
                </div>
              ) }
            </div>
          </div>

          {/* 状态和折叠按钮区域 - 在窄屏幕下会另起一行 */ }
          <div className="ml-auto flex items-center gap-2">
            {/* 状态标签 */ }
            <span className={ cn(
              'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
              statusConfig.className,
            ) }>
              { statusConfig.label }
            </span>

            {/* 收起/展开按钮 */ }
            { collapsible && hasContent && (
              <motion.button
                className="shrink-0 rounded-full p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={ handleToggleCollapse }
                whileHover={ { scale: 1.1 } }
                whileTap={ { scale: 0.9 } }
              >
                <ChevronDown className={ cn(
                  'h-4 w-4 text-gray-500 dark:text-gray-400',
                  isCollapsed && 'rotate-180',
                  'transition-all duration-300',
                ) } />
              </motion.button>
            ) }
          </div>
        </div>
      </div>

      {/* 可收起的内容区域 */ }
      <AnimatePresence initial={ false }>
        { !isCollapsed && hasContent && (
          <motion.div
            initial={ { height: 0, opacity: 0 } }
            animate={ { height: 'auto', opacity: 1 } }
            exit={ { height: 0, opacity: 0 } }
            transition={ { duration: 0.3, ease: 'easeInOut' } }
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* 描述文本 */ }
              { task.description && (
                <p className="mb-3 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
                  { task.description }
                </p>
              ) }

              {/* 操作按钮 */ }
              { task.actions && task.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  { task.actions.map(action => (
                    <Button
                      key={ action.key }
                      onClick={ (e) => {
                        e.stopPropagation()
                        handleActionClick(action)
                      } }
                      disabled={ action.disabled }
                      variant="primary"
                      rounded="lg"
                      size="sm"
                    >
                      { action.label }
                    </Button>
                  )) }
                </div>
              ) }
            </div>
          </motion.div>
        ) }
      </AnimatePresence>
    </div>
  )

  /** 根据状态决定是否使用发光边框 */
  return showGlowBorder
    ? (
        <GlowBorder
          className="rounded-2xl"
          borderSize={ 2 }
          gradientColors={ ['#D89FFF', '#A7AFFF', '#5AC8FF', '#3AD2FF'] }
          animationDuration="3s"
        >
          { taskContent }
        </GlowBorder>
      )
    : taskContent
})

AgentTaskItem.displayName = 'AgentTaskItem'

export type AgentTaskItemProps = {
  /**
   * 任务数据
   */
  task: AgentTask
  /**
   * 任务点击事件
   */
  onTaskClick?: (task: AgentTask) => void
  /**
   * 操作按钮点击事件
   */
  onActionClick?: (task: AgentTask, action: string) => void
  /**
   * 默认是否收起
   * @default false
   */
  defaultCollapsed?: boolean
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
& MotionProps
