'use client'

import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { forwardRef, memo, useState } from 'react'
import { cn } from 'utils'
import { CloseBtn } from '../CloseBtn'

const InnerCascaderDefaultTrigger = forwardRef<HTMLDivElement, CascaderDefaultTriggerProps>((props, ref) => {
  const {
    triggerProps,
    isOpen,
    shadowed,
    bordered,
    disabled,
    selectedLabel,
    hasSelection,
    placeholder,
    canClear,
    clearIcon,
    onClear,
    onTriggerClick,
    onTriggerMouseEnter,
    onTriggerMouseLeave,
  } = props
  const [hovered, setHovered] = useState(false)

  return (
    <div
      { ...triggerProps }
      ref={ ref }
      onClick={ onTriggerClick }
      onMouseEnter={ () => {
        setHovered(true)
        onTriggerMouseEnter()
      } }
      onMouseLeave={ () => {
        setHovered(false)
        onTriggerMouseLeave()
      } }
    >
      <div
        className={ cn(
          'flex min-h-9 items-center gap-2 rounded-xl bg-background px-3 py-1.5 text-sm transition-colors hover:bg-background2',
          shadowed && 'shadow-card',
          bordered && 'border border-border',
          isOpen && 'bg-background2',
          disabled && 'opacity-50',
        ) }
      >
        <span
          className={ cn(
            'min-w-0 flex-1 truncate',
            hasSelection
              ? 'text-text'
              : 'text-text2',
          ) }
        >
          { selectedLabel ?? placeholder }
        </span>

        <span className="flex size-5 shrink-0 items-center justify-center">
          { canClear && hovered
            ? (
              <CloseBtn
                mode="static"
                size={ 20 }
                iconSize={ 13 }
                strokeWidth={ 3 }
                aria-label="Clear selection"
                className="rounded-md"
                onClick={ onClear }
              >
                { clearIcon }
              </CloseBtn>
            )
            : (
              <ChevronDown
                className={ cn(
                  'size-4 text-text2 transition-transform',
                  isOpen && 'rotate-180',
                ) }
              />
            ) }
        </span>
      </div>
    </div>
  )
})

InnerCascaderDefaultTrigger.displayName = 'CascaderDefaultTrigger'

export const CascaderDefaultTrigger = memo(InnerCascaderDefaultTrigger)

type CascaderDefaultTriggerProps = {
  triggerProps: React.HTMLAttributes<HTMLDivElement>
  isOpen: boolean
  shadowed: boolean
  bordered: boolean
  disabled: boolean
  selectedLabel?: ReactNode
  hasSelection: boolean
  placeholder: string
  canClear: boolean
  clearIcon?: ReactNode
  onClear: (event: React.MouseEvent<HTMLButtonElement>) => void
  onTriggerClick: () => void
  onTriggerMouseEnter: () => void
  onTriggerMouseLeave: () => void
}
