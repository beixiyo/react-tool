import type { CSSProperties, ReactNode } from 'react'
import { clamp } from '@jl-org/tool'
import { memo } from 'react'
import { cn } from 'utils'
import { Popover } from '../../Popover'
import { DATA_DATE_PICKER_IGNORE } from '../constants'

/** 小时、分钟和秒共用的数字选项浮层 */
export const TimeUnitPopover = memo<TimeUnitPopoverProps>(({
  children,
  options,
  selected,
  onSelect,
  disabled,
  contentClassName,
  contentStyle,
}) => (
  <Popover
    trigger="click"
    position="top"
    disabled={ disabled }
    contentClassName={ contentClassName }
    contentStyle={ contentStyle }
    content={ (
      <div
        className="max-h-60 overflow-y-auto p-2 scrollbar-none"
        { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
      >
        <div
          className="grid gap-1"
          style={ { gridTemplateColumns: `repeat(${clamp(options.length, 1, 6)}, 1fr)` } }
        >
          { options.map(option => (
            <button
              type="button"
              key={ option }
              className={ cn(
                'size-8 flex items-center justify-center text-xs rounded-full cursor-pointer transition-all',
                option === selected
                  ? 'bg-button text-button3'
                  : 'hover:bg-background3 text-text',
              ) }
              onClick={ () => onSelect(option) }
            >
              { String(option).padStart(2, '0') }
            </button>
          )) }
        </div>
      </div>
    ) }
  >
    { children }
  </Popover>
))

TimeUnitPopover.displayName = 'TimeUnitPopover'

type TimeUnitPopoverProps = {
  children: ReactNode
  options: number[]
  selected: number
  onSelect: (value: number) => void
  disabled: boolean
  contentClassName?: string
  contentStyle?: CSSProperties
}
