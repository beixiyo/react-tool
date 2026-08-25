import { clamp } from '@jl-org/tool'
import { setHours, setMinutes } from 'date-fns'
import { Check } from 'lucide-react'
import type { CSSProperties, MouseEvent, ReactElement } from 'react'
import { cloneElement, memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../../i18n'
import type { PopoverRef } from '../../Popover'
import { Popover } from '../../Popover'
import { DATA_DATE_PICKER_IGNORE, DATA_QUICK_TIME_IGNORE, DATA_QUICK_TIME_TRIGGER } from '../constants'

/** 一次选择完整时分的快捷时刻浮层 */
export const QuickTimePopover = memo<QuickTimePopoverProps>(({
  value,
  use12Hours = false,
  step,
  disabled,
  onChange,
  contentClassName,
  contentStyle,
  children,
  popoverRef,
  onOpen,
}) => {
  const t = useT()
  const normalizedStep = normalizeQuickTimeStep(step)
  const options = useMemo(() =>
    normalizedStep
      ? Array.from({ length: Math.ceil(1440 / normalizedStep) }, (_, index) => index * normalizedStep)
      : [], [normalizedStep])
  const usesBackground3 = hasBackground3(contentClassName)
  const optionSelectedBackground = usesBackground3
    ? 'bg-background4'
    : 'bg-background3'
  const optionHoverBackground = usesBackground3
    ? 'hover:bg-background4'
    : 'hover:bg-background3'

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
  const selectTime = (hours: number, minutes: number) => {
    onChange(setMinutes(setHours(value, hours), minutes))
    popoverRef.current?.close()
  }
  const amLabel = t('datePicker.am') || '上午'
  const pmLabel = t('datePicker.pm') || '下午'
  const periodPosition = t('datePicker.periodPosition') || 'left'
  const content = (
    <div
      className="max-h-56 overflow-y-auto scrollbar-none"
      { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
    >
      <div role="listbox" aria-label={ t('datePicker.quickTime') || '快捷时间' }>
        { options.map((totalMinutes) => {
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          const selected = value.getHours() === hours && value.getMinutes() === minutes
          const time = formatQuickTime({ hours, minutes, use12Hours, amLabel, pmLabel, periodPosition })

          return (
            <button
              type="button"
              role="option"
              aria-selected={ selected }
              key={ totalMinutes }
              className={ cn(
                'my-0.5 flex w-full items-center justify-between gap-4 rounded-xl px-4 py-2.5 text-sm transition-colors',
                selected
                  ? cn('text-text', optionSelectedBackground)
                  : cn('text-text', optionHoverBackground),
              ) }
              onClick={ () => selectTime(hours, minutes) }
            >
              <span>{ time }</span>
              { selected && <Check className="size-4 shrink-0 text-button" /> }
            </button>
          )
        }) }
      </div>
    </div>
  )

  return (
    <Popover
      ref={ popoverRef }
      trigger="command"
      arrow={ false }
      disabled={ disabled }
      className="w-full"
      position="top"
      align="start"
      contentClassName={ cn('w-40 p-2', contentClassName) }
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

function hasBackground3(className: string | undefined): boolean {
  return className?.split(/\s+/).some((token) => token === 'bg-background3' || token.startsWith('bg-background3/')) ?? false
}

function formatQuickTime(options: FormatQuickTimeOptions): string {
  const { hours, minutes, use12Hours, amLabel, pmLabel, periodPosition } = options
  const minuteText = String(minutes).padStart(2, '0')

  if (!use12Hours) return `${String(hours).padStart(2, '0')}:${minuteText}`

  const time = `${hours % 12 || 12}:${minuteText}`
  const period = hours >= 12
    ? pmLabel
    : amLabel
  return periodPosition === 'left'
    ? `${period} ${time}`
    : `${time} ${period}`
}

type QuickTimePopoverProps = {
  value: Date
  use12Hours?: boolean
  step?: number
  disabled: boolean
  onChange: (value: Date) => void
  contentClassName?: string
  contentStyle?: CSSProperties
  children: ReactElement<QuickTimeTriggerProps>
  popoverRef: React.RefObject<PopoverRef | null>
  onOpen: () => void
}

type FormatQuickTimeOptions = {
  hours: number
  minutes: number
  use12Hours: boolean
  amLabel: string
  pmLabel: string
  periodPosition: string
}

export type QuickTimeTriggerProps = {
  className?: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
} & Partial<Record<typeof DATA_QUICK_TIME_TRIGGER, string>>
