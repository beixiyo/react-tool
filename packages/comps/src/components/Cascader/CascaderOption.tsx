import type { CascaderOptionProps } from './types'
import { Check, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export const CascaderOption = memo(({
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
  optionClickIgnoreSelector,
}: CascaderOptionProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (option.disabled)
      return
    if (optionClickIgnoreSelector && (e.target as HTMLElement).closest(optionClickIgnoreSelector))
      return
    onClick(option.value)
  }

  return (
    <div
      className={ cn(
        'flex items-center justify-between px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out',
        'text-textPrimary bg-background rounded-xl mx-1 my-0.5',
        option.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-backgroundTertiary',
        selected && !option.children
          ? 'bg-backgroundSecondary text-textPrimary'
          : '',
        highlighted && !option.disabled && 'bg-backgroundSecondary',
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
        <Check className={ cn('h-4 w-4 shrink-0 text-textPrimary', checkIconClassName) } />
      ) }
      { option.children && (
        <ChevronRight className={ cn('h-4 w-4 shrink-0 text-textSecondary', chevronIconClassName) } />
      ) }
    </div>
  )
})

CascaderOption.displayName = 'CascaderOption'
