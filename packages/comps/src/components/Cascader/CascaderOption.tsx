import type { CascaderOptionProps } from './types'
import { Check, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { DATA_CASCADER_SELECTED } from './constants'

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
      { ...{ [DATA_CASCADER_SELECTED]: selected && !option.children } }
      className={ cn(
        'flex items-center justify-between px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out',
        'text-text bg-background rounded-xl mx-1 my-0.5',
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

CascaderOption.displayName = 'CascaderOption'
