import type { CascaderOption as Option } from './types'
import { Check, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export const CascaderOption = memo(({ option, selected, highlighted, onClick, onMouseEnter, className, optionClickIgnoreSelector }: CascaderOptionProps) => {
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
      <div className="flex flex-1 items-center gap-2">
        { option.icon && option.icon }
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

CascaderOption.displayName = 'CascaderOption'

interface CascaderOptionProps {
  option: Option
  selected: boolean
  highlighted?: boolean
  onClick: (value: string) => void
  onMouseEnter?: () => void
  className?: string
  /** 命中时不触发选项选中/关闭（由 Cascader 传入） */
  optionClickIgnoreSelector?: string
}
