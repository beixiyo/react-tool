import type { Option } from './types'
import { Check, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export const SelectOption = memo(({ option, selected, onClick, onMouseEnter }: SelectOptionProps) => {
  const handleClick = () => {
    if (!option.disabled) {
      onClick(option.value)
    }
  }

  return (
    <div
      className={ cn(
        'flex items-center justify-between px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out',
        'text-textPrimary bg-background rounded-md mx-1 my-0.5 overflow-hidden',
        option.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-backgroundSecondary',
        selected && !option.children
          ? 'bg-backgroundSecondary text-textPrimary'
          : '',
      ) }
      onClick={ handleClick }
      onMouseEnter={ onMouseEnter }
    >
      <div className="flex flex-1 items-center gap-2">
        { option.icon && <span className="h-5 w-5">{ option.icon }</span> }
        <span className="truncate">{ option.label }</span>
      </div>

      { selected && !option.children && (
        <Check className="h-4 w-4 shrink-0 text-textPrimary" />
      ) }
      { option.children && (
        <ChevronRight className="h-4 w-4 shrink-0 text-textSecondary" />
      ) }
    </div>
  )
})

SelectOption.displayName = 'SelectOption'

interface SelectOptionProps {
  option: Option
  selected: boolean
  onClick: (value: string) => void
  onMouseEnter?: () => void
}
