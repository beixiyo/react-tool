import type { MotionProps } from 'framer-motion'
import type { AgentTask } from '../types'
import { motion } from 'framer-motion'
import { ChevronDown, PanelLeft, Plus } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar'
import { Button } from '@/components/Button/Button'
import { Popover } from '@/components/Popover'
import { getStatusConfig } from '../config'
import { AgentTaskItem } from './AgentTaskItem'

export const AgentProgress = memo<AgentProgressProps>(({
  tasks = [],
  className,
  style,
  onTaskClick,
  onActionClick,
  defaultCollapsed = false,
  expandedWidth = 335,
  collapsedWidth = 72,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}) => {
  return (
    <CollapsibleSidebar
      isCollapsed={ isCollapsed }
      onToggle={ onToggleCollapse }
      expandedWidth={ expandedWidth }
      collapsedWidth={ collapsedWidth }
      showToggleButton={ false }
      className={ cn(
        'AgentProgressContainer h-full bg-white dark:bg-slate-800',
        isCollapsed
          ? 'border-r border-gray-200 dark:border-slate-700'
          : 'border-r border-gray-200 dark:border-slate-700',
        className,
      ) }
      contentClassName="flex h-full flex-col"
      style={ style }
    >
      <motion.div
        className="flex h-full flex-col"
        style={ {
          width: isCollapsed
            ? collapsedWidth
            : expandedWidth,
        } }
        { ...props }
      >
        {/* 头部区域 */ }
        <div className={ cn(
          'shrink-0',
          isCollapsed
            ? 'p-2'
            : 'px-4 pt-2 border-b border-gray-100 dark:border-slate-700/50',
        ) }>
          { isCollapsed
            ? (
                /** 折叠状态：顶部显示展开按钮 */
                  <div className="flex justify-center">
                    <Button
                      onClick={ onToggleCollapse }
                      rounded="full"
                      leftIcon={ <PanelLeft
                        size={ 18 }
                        strokeWidth={ 1.5 }
                      /> }
                    />
                  </div>
                )
            : (
                /** 展开状态：显示完整头部 */
                  <div className="mb-3 flex flex-col">
                    {/* 折叠按钮单独一行 */ }
                    <div className="mb-3">
                      <Button
                        onClick={ onToggleCollapse }
                        rounded="full"
                        leftIcon={ <PanelLeft
                          size={ 18 }
                          strokeWidth={ 1.5 }
                        /> }
                      />
                    </div>

                    {/* 项目标题行和添加按钮 */ }
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          rounded="full"
                          leftIcon={ <ChevronDown size={ 18 } strokeWidth={ 1.5 } /> }
                        />

                        <h3 className="truncate text-sm text-gray-900 font-medium dark:text-gray-100">
                          Project-1 Name Goes Here...
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          rounded="full"
                          leftIcon={ <Plus
                            size={ 18 }
                            strokeWidth={ 1.5 }
                          /> }
                        />
                      </div>
                    </div>
                  </div>
                ) }
        </div>

        {/* 内容区域 */ }
        <motion.div
          className={ cn(
            'hide-scroll flex-1 overflow-y-auto',
          ) }
          animate={ {
            opacity: isCollapsed
              ? 1
              : 1,
          } }
        >
          { isCollapsed
            ? (
                <div className="flex flex-col items-center py-4 space-y-4">
                  { tasks.map((task, index) => {
                    const statusConfig = getStatusConfig(task.status)
                    return (
                      <Popover
                        key={ task.id }
                        position="right"
                        content={
                          <AgentTaskItem
                            task={ task }
                            onTaskClick={ onTaskClick }
                            onActionClick={ onActionClick }
                            defaultCollapsed={ defaultCollapsed }
                            className="w-84"
                          />
                        }
                        trigger="hover"
                        removeDelay={ 100 }
                      >
                        <div
                          className={ cn(
                            'w-12 h-12 rounded-full flex items-center justify-center cursor-pointer',
                            'border transition-colors duration-200',
                            statusConfig.className,
                          ) }
                          onClick={ () => onTaskClick?.(task) }
                        >
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
                      </Popover>
                    )
                  }) }
                  { tasks.length === 0 && (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                      <p>空</p>
                    </div>
                  ) }
                </div>
              )
            : (
                <div className="p-3 space-y-4">
                  { tasks.map((task, index) => (
                    <AgentTaskItem
                      key={ task.id }
                      task={ task }
                      onTaskClick={ onTaskClick }
                      onActionClick={ onActionClick }
                      defaultCollapsed={ defaultCollapsed }
                    />
                  )) }
                  { tasks.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <p>暂无任务</p>
                    </div>
                  ) }
                </div>
              ) }
        </motion.div>
      </motion.div>
    </CollapsibleSidebar>
  )
})

AgentProgress.displayName = 'AgentProgress'

export type AgentProgressProps = {
  /**
   * 智能体任务列表
   */
  tasks?: AgentTask[]
  /**
   * 任务点击事件
   */
  onTaskClick?: (task: AgentTask) => void
  /**
   * 操作按钮点击事件
   */
  onActionClick?: (task: AgentTask, action: string) => void
  /**
   * 默认是否收起任务详情
   * @default false
   */
  defaultCollapsed?: boolean
  /**
   * 展开时的宽度
   * @default 335
   */
  expandedWidth?: number
  /**
   * 收起时的宽度
   * @default 50
   */
  collapsedWidth?: number
  /**
   * 是否折叠内容
   * @default false
   */
  isCollapsed?: boolean
  /**
   * 切换折叠状态回调
   */
  onToggleCollapse?: () => void
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
& MotionProps
