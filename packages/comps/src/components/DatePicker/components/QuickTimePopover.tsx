import type { CSSProperties, ReactNode } from 'react'
import type { PopoverRef } from '../../Popover'
import { clamp } from '@jl-org/tool'
import { setHours, setMinutes } from 'date-fns'
import { Clock } from 'lucide-react'
import { memo, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { useT } from '../../../i18n'
import { Popover } from '../../Popover'
import { DATA_DATE_PICKER_IGNORE } from '../constants'

/** 一次选择完整时分的快捷时刻浮层 */
export const QuickTimePopover = memo<QuickTimePopoverProps>(({
  value,
  step,
  icon,
  disabled,
  onChange,
  contentClassName,
  contentStyle,
}) => {
  const t = useT()
  const popoverRef = useRef<PopoverRef>(null)
  const normalizedStep = normalizeQuickTimeStep(step)
  const options = useMemo(() => normalizedStep
    ? Array.from({ length: Math.ceil(1440 / normalizedStep) }, (_, index) => index * normalizedStep)
    : [], [normalizedStep])

  const trigger = (
    <button
      type="button"
      aria-label={ t('datePicker.quickTime') }
      aria-disabled={ !normalizedStep || undefined }
      tabIndex={ normalizedStep
        ? undefined
        : -1 }
      disabled={ disabled }
      className={ cn(
        'size-6 flex items-center justify-center rounded-md text-iconColor transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:text-current',
        normalizedStep
          ? 'cursor-pointer hover:bg-background3 hover:text-brand'
          : 'cursor-default',
      ) }
    >
      { icon ?? <Clock className="size-4" /> }
    </button>
  )

  if (!normalizedStep)
    return trigger

  return (
    <Popover
      ref={ popoverRef }
      trigger="click"
      arrow={ false }
      disabled={ disabled }
      position="top"
      align="start"
      contentClassName={ cn('p-2', contentClassName) }
      contentStyle={ contentStyle }
      content={ (
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
      ) }
    >
      { trigger }
    </Popover>
  )
})

QuickTimePopover.displayName = 'QuickTimePopover'

function normalizeQuickTimeStep(step: number | undefined): number | undefined {
  if (step === undefined || !Number.isFinite(step) || step <= 0)
    return undefined

  return clamp(Math.round(step), 5, 1440)
}

type QuickTimePopoverProps = {
  value: Date
  step?: number
  icon?: ReactNode
  disabled: boolean
  onChange: (value: Date) => void
  contentClassName?: string
  contentStyle?: CSSProperties
}
