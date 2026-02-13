import type { SelectOptionProps } from './types'
import { Check, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export const SelectOption = memo(({
  option,
  selected,
  highlighted,
  onClick,
  onMouseEnter,
  className,
  contentClassName,
  labelClassName,
  checkIconClassName,
  chevronIconClassName,
}: SelectOptionProps) => {
  const handleClick = () => {
    if (!option.disabled) {
      onClick(option.value)
    }
  }

  return (
    <div
      className={ cn(
        'flex items-center justify-between px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out',
        'text-text bg-background rounded-md mx-1 my-0.5 overflow-hidden',
        option.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-background3',
        selected && !option.children
          ? 'bg-background2 text-text'
          : '',
        highlighted && !option.disabled && 'bg-background2',
        className,
      ) }
      onClick={ handleClick }
      onMouseEnter={ onMouseEnter }
    >
      <div className={ cn('flex flex-1 items-center gap-2', contentClassName) }>
        { option.icon && option.icon }
        <div className={ cn('truncate text-sm', labelClassName) }>{ option.label }</div>
      </div>

      { selected && !option.children && (
        <Check className={ cn('h-4 w-4 shrink-0 text-text', checkIconClassName) } />
      ) }
      { option.children && (
        <ChevronRight className={ cn('h-4 w-4 shrink-0 text-text2', chevronIconClassName) } />
      ) }
    </div>
  )
})

SelectOption.displayName = 'SelectOption'
