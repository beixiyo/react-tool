import { clamp } from '@jl-org/tool'
import { setHours, setMinutes } from 'date-fns'
import type { CSSProperties, MouseEvent, ReactElement } from 'react'
import { cloneElement, memo, useMemo } from 'react'
import { cn } from 'utils'
import type { PopoverRef } from '../../Popover'
import { Popover } from '../../Popover'
import { DATA_DATE_PICKER_IGNORE, DATA_QUICK_TIME_IGNORE, DATA_QUICK_TIME_TRIGGER } from '../constants'

/** 一次选择完整时分的快捷时刻浮层 */
export const QuickTimePopover = memo<QuickTimePopoverProps>(({
  value,
  step,
  disabled,
  onChange,
  contentClassName,
  contentStyle,
  children,
  popoverRef,
  onOpen,
}) => {
  const normalizedStep = normalizeQuickTimeStep(step)
  const options = useMemo(() =>
    normalizedStep
      ? Array.from({ length: Math.ceil(1440 / normalizedStep) }, (_, index) => index * normalizedStep)
      : [], [normalizedStep])

  if (!normalizedStep) return children

  const trigger = cloneElement(children, {
    [DATA_QUICK_TIME_TRIGGER]: 'true',
    className: cn(children.props.className, !disabled && 'cursor-pointer'),
    onClick: (event: MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event)
      if (
        event.defaultPrevented
        || disabled
        || (event.target as HTMLElement).closest(`[${DATA_QUICK_TIME_IGNORE}]`)
      ) return

      popoverRef.current?.open()
    },
  })
  const content = (
    <div
      className="grid max-h-56 grid-cols-4 gap-1 overflow-y-auto scrollbar-none"
      { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
    >
      { options.map((totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return (
          <button
            type="button"
            key={ totalMinutes }
            className="rounded-lg px-2 py-1.5 text-xs text-text transition-colors hover:bg-background3"
            onClick={ () => {
              onChange(setMinutes(setHours(value, hours), minutes))
              popoverRef.current?.close()
            } }
          >
            { `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` }
          </button>
        )
      }) }
    </div>
  )

  return (
    <Popover
      ref={ popoverRef }
      trigger="command"
      arrow={ false }
      disabled={ disabled }
      position="top"
      align="start"
      contentClassName={ cn('p-2', contentClassName) }
      contentStyle={ contentStyle }
      onOpen={ onOpen }
      content={ content }
    >
      { trigger }
    </Popover>
  )
})

QuickTimePopover.displayName = 'QuickTimePopover'

function normalizeQuickTimeStep(step: number | undefined): number | undefined {
  if (step === undefined || !Number.isFinite(step) || step <= 0) return undefined

  return clamp(Math.round(step), 5, 1440)
}

type QuickTimePopoverProps = {
  value: Date
  step?: number
  disabled: boolean
  onChange: (value: Date) => void
  contentClassName?: string
  contentStyle?: CSSProperties
  children: ReactElement<QuickTimeTriggerProps>
  popoverRef: React.RefObject<PopoverRef | null>
  onOpen: () => void
}

export type QuickTimeTriggerProps = {
  className?: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
} & Partial<Record<typeof DATA_QUICK_TIME_TRIGGER, string>>
