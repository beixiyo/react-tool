import type { CSSProperties, ReactNode } from 'react'
import { clamp } from '@jl-org/tool'
import { useScrollIntoView } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { Popover } from '../../Popover'
import { DATA_DATE_PICKER_IGNORE } from '../constants'

const TIME_UNIT_CLOSE_KEYS = ['Escape', 'Enter']

/** 小时、分钟和秒共用的数字选项浮层 */
export const TimeUnitPopover = memo<TimeUnitPopoverProps>(({
  children,
  options,
  selected,
  onSelect,
  disabled,
  contentClassName,
  contentStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const optionsRef = useRef<HTMLDivElement>(null)
  const { scrollIntoView } = useScrollIntoView({
    delay: 80,
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
  })

  useEffect(() => {
    if (!isOpen)
      return

    scrollIntoView(() => (
      optionsRef.current?.querySelector('[aria-pressed="true"]') ?? null
    ))
  }, [isOpen, scrollIntoView, selected])

  return (
    <Popover
      trigger="click"
      position="top"
      closeKeys={ TIME_UNIT_CLOSE_KEYS }
      disabled={ disabled }
      contentClassName={ contentClassName }
      contentStyle={ contentStyle }
      onOpen={ () => setIsOpen(true) }
      onClose={ () => setIsOpen(false) }
      content={ (
        <div
          className="max-h-60 overflow-x-hidden overflow-y-auto p-2 scrollbar-none"
          { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
        >
          <div
            ref={ optionsRef }
            className="grid gap-1"
            style={ { gridTemplateColumns: `repeat(${clamp(options.length, 1, 6)}, 1fr)` } }
          >
            { options.map(option => (
              <button
                type="button"
                key={ option }
                aria-pressed={ option === selected }
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
  )
})

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
