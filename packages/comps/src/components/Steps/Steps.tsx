'use client'

import type { StepsProps } from './types'
import { timer } from '@jl-org/tool'
import { ChevronUp, CircleCheck, CircleDashed, Loader2 } from 'lucide-react'
import React from 'react'
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
  }: StepsProps,
) => {
  const [expanded, setExpanded] = useState(false)
  const isHorizontal = direction === 'horizontal'
  const [time, setTime] = useState(0)

  useEffect(
    () => timer(t => setTime(Math.round(t / 1000)), 1000),
    [],
  )

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
        <h3 className="flex flex-col gap-1 text-sm text-gray-900 font-medium">
          <span className="font-bold">Task lists:</span>
          <span className="text-gray-400">
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
                  : <CircleDashed className="h-5 w-5 text-gray-400" /> }
              <span
                className={ cn(
                  'text-sm',
                  task.completed
                    ? 'text-gray-400'
                    : task.inProgress
                      ? 'text-gray-800'
                      : 'text-gray-500',
                ) }
              >
                { task.title }
              </span>

              { task.inProgress && (
                <span className="ml-auto rounded-full bg-neutral-900/10 dark:bg-white/10 px-2 py-0.5 text-xs text-neutral-900 dark:text-white">
                  In Progress
                </span>
              ) }
            </li>
          )) }
        </ul>
      </div>
    )
  }, [items, time, slotClassName])

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
          <React.Fragment key={ index }>
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
                    : 'bg-gray-200',
                ) }
              />
            ) }
          </React.Fragment>
        )
      }) }

      { showProgress && items.length > 0 && (
        <div className="ml-auto flex items-center">
          <span className="text-sm text-gray-500">
            { Math.min(current + 1, items.length) }
            /
            { items.length }
          </span>

          { expandable && (
            <button
              onClick={ toggleExpand }
              className="rounded-md p-1 transition-colors hover:bg-gray-100"
              aria-expanded={ expanded }
              aria-label={ expanded
                ? 'Collapse details'
                : 'Expand details' }
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
    className={ cn('rounded-lg border border-gray-200 p-2 relative', className) }
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
            ? 'absolute left-1/2 bottom-full mb-2 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-md -translate-x-1/2'
            : 'border-t border-gray-200',

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
