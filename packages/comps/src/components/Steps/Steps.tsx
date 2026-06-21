'use client'

import type { StepsProps } from './types'
import { timer } from '@jl-org/tool'
import { ChevronUp, CircleCheck, CircleDashed, Loader2 } from 'lucide-react'
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { StepItem } from './StepItem'

export const Steps = memo((
  {
    direction = 'horizontal',
    labelPlacement = 'horizontal',
    expandDirection = 'down',
    progressDot = false,
    size = 18,
    items,
    className,
    slotClassName,
    showProgress = true,
    expandable = true,
    showLinkLine = true,
    children,
    taskListTitle = 'Task lists:',
    inProgressLabel = 'In Progress',
    expandLabel = 'Expand details',
    collapseLabel = 'Collapse details',
  }: StepsProps,
) => {
  const [expanded, setExpanded] = useState(false)
  const isHorizontal = direction === 'horizontal'
  const [time, setTime] = useState(0)

  /** 挂载时间戳，用于在计时器按需启停时仍能换算出『自挂载以来的总耗时』 */
  const mountedAtRef = useRef(Date.now())

  /**
   * 仅在耗时显示真正可见时才启动 rAF 计时器，避免常驻的每秒重渲染。
   * 当 expandable=false、未展开、或传入了自定义 children 时无需计时。
   */
  const isTimerNeeded = expandable && expanded && !children

  useEffect(() => {
    if (!isTimerNeeded)
      return

    /** 立即同步一次，避免展开瞬间显示上一拍的旧值 */
    setTime(Math.round((Date.now() - mountedAtRef.current) / 1000))
    return timer(
      () => setTime(Math.round((Date.now() - mountedAtRef.current) / 1000)),
      1000,
    )
  }, [isTimerNeeded])

  // Calculate the current step based on the items' status
  const current = useMemo(() => {
    // Find the index of the last item with status "finish"
    const lastFinishedIndex = items.reduce((lastIndex, item, index) => {
      return item.status === 'finish'
        ? index
        : lastIndex
    }, -1)

    // Current is the next step after the last finished one
    return lastFinishedIndex + 1
  }, [items])

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  // Generate default content if none provided
  const defaultContent = useMemo(() => {
    const steps = items.map((item, index) => ({
      id: index,
      title: item.title || `Step ${index + 1}`,
      completed: item.status === 'finish',
      inProgress: item.status === 'process',
      icon: item.icon,
    }))

    return (
      <div className={ cn(
        'overflow-auto space-y-3 p-2 min-w-72',
        slotClassName,
      ) }>
        <h3 className="flex flex-col gap-1 text-sm text-text font-medium">
          <span className="font-bold">{ taskListTitle }</span>
          <span className="text-text2">
            { `${time}s` }
          </span>
        </h3>
        <ul className="space-y-2">
          { steps.map(task => (
            <li key={ task.id } className="flex items-center gap-2">
              { task.completed
                ? <>{ task.icon || <CircleCheck className="h-5 w-5 text-neutral-900 dark:text-white" /> }</>
                : task.inProgress

                  ? <Loader2 className="h-5 w-5 animate-spin text-neutral-900 dark:text-white" />
                  : <CircleDashed className="h-5 w-5 text-text2" /> }
              <span
                className={ cn(
                  'text-sm',
                  task.completed
                    ? 'text-text2'
                    : task.inProgress
                      ? 'text-text'
                      : 'text-text2',
                ) }
              >
                { task.title }
              </span>

              { task.inProgress && (
                <span className="ml-auto rounded-full bg-neutral-900/10 dark:bg-white/10 px-2 py-0.5 text-xs text-neutral-900 dark:text-white">
                  { inProgressLabel }
                </span>
              ) }
            </li>
          )) }
        </ul>
      </div>
    )
  }, [items, time, slotClassName, taskListTitle, inProgressLabel])

  // Steps and progress section
  const stepsSection = (
    <div className={ cn('flex relative gap-2', isHorizontal
      ? 'flex-row items-center'
      : 'flex-col') }>
      { items.map((item, index) => {
        const isLast = index === items.length - 1
        const nextItemStatus = !isLast
          ? items[index + 1].status
          : null

        return (
          <Fragment key={ index }>
            <StepItem
              { ...item }
              index={ index }
              isLast={ isLast }
              direction={ direction }
              labelPlacement={ labelPlacement }
              progressDot={ progressDot }
              size={ size }
              className={ cn(
                'flex-1',
                isHorizontal && labelPlacement === 'vertical' && 'mb-6',
                !isHorizontal && !isLast && 'mb-4',
                item.className,
              ) }
            />

            {/* Line */ }
            { isHorizontal && !isLast && showLinkLine && (
              <div
                className={ cn(
                  'flex-1 h-[2px] transition-all duration-500 ease-in-out',
                  // If current item is finished OR next item is finished/process, color the line
                  item.status === 'finish' || nextItemStatus === 'finish' || nextItemStatus === 'process'
                    ? 'bg-neutral-900 dark:bg-white'
                    : 'bg-background3',
                ) }
              />
            ) }
          </Fragment>
        )
      }) }

      { showProgress && items.length > 0 && (
        <div className="ml-auto flex items-center">
          <span className="text-sm text-text2">
            { Math.min(current + 1, items.length) }
            /
            { items.length }
          </span>

          { expandable && (
            <button
              onClick={ toggleExpand }
              className="rounded-md p-1 transition-colors hover:bg-background3"
              aria-expanded={ expanded }
              aria-label={ expanded
                ? collapseLabel
                : expandLabel }
            >
              <div className="transform transition-transform duration-300">
                <ChevronUp
                  className="h-4 w-4 transition-all duration-300"
                  style={ {
                    transform: expanded
                      ? expandDirection === 'down'
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)'
                      : expandDirection === 'down'
                        ? 'rotate(0deg)'
                        : 'rotate(180deg)',
                  } }
                />
              </div>
            </button>
          ) }
        </div>
      ) }
    </div>
  )

  return <div
    className={ cn('rounded-lg border border-border p-2 relative', className) }
  >
    {/* Main content */ }
    { stepsSection }

    {/* Expandable content with absolute positioning when expanding upward */ }
    { expandable && (
      <div
        className={ cn(
          'transition-all duration-500 ease-in-out',
          expanded
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none',

          expandDirection === 'up'
            ? 'absolute left-1/2 bottom-full mb-2 z-dropdown bg-background border border-border rounded-lg p-2 shadow-md -translate-x-1/2'
            : 'border-t border-border',

          expanded && expandDirection === 'up'
            ? 'translate-y-0'
            : 'translate-y-2',

          !expanded && expandDirection === 'down' && 'max-h-0 overflow-hidden',
          expanded && expandDirection === 'down' && 'max-h-96 overflow-auto',
        ) }
      >
        { children || defaultContent }
      </div>
    ) }
  </div>
})

Steps.displayName = 'Steps'
