'use client'

import type { RefObject } from 'react'
import { forwardRef, memo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'

const InnerCascaderEditableTrigger = forwardRef<HTMLDivElement, CascaderEditableTriggerProps>((props, ref) => {
  const {
    isOpen,
    listboxId,
    activeDescendant,
    disabled,
    hasSelection,
    invalid,
    shadowed,
    bordered,
    className,
    inputRef,
    inputText,
    placeholder,
    inputClassName,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onInputKeyDown,
  } = props

  return (
    <div
      ref={ ref }
      role="combobox"
      aria-expanded={ isOpen }
      aria-haspopup="listbox"
      aria-controls={ isOpen
        ? listboxId
        : undefined }
      aria-activedescendant={ isOpen
        ? activeDescendant
        : undefined }
      aria-autocomplete="list"
      aria-disabled={ disabled || undefined }
      { ...{
        [DATA_ATTR.state]: isOpen,
        [DATA_ATTR.selected]: hasSelection,
        [DATA_ATTR.disabled]: disabled,
        [DATA_ATTR.invalid]: invalid,
      } }
      className={ cn(
        'inline-flex min-h-9 min-w-48 items-center rounded-xl bg-background px-3 py-1.5 text-sm transition-colors focus-within:bg-background2',
        shadowed && 'shadow-card',
        bordered && 'border border-border',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-text',
        className,
      ) }
      onClick={ () => inputRef.current?.focus() }
    >
      <input
        ref={ inputRef }
        value={ inputText }
        onChange={ (event) => onInputChange(event.target.value) }
        onFocus={ onInputFocus }
        onBlur={ onInputBlur }
        onKeyDown={ onInputKeyDown }
        aria-controls={ isOpen
          ? listboxId
          : undefined }
        aria-activedescendant={ isOpen
          ? activeDescendant
          : undefined }
        aria-autocomplete="list"
        disabled={ disabled }
        placeholder={ placeholder }
        className={ cn('min-w-0 flex-1 bg-transparent outline-none placeholder:text-text2', inputClassName) }
      />
    </div>
  )
})

InnerCascaderEditableTrigger.displayName = 'CascaderEditableTrigger'

export const CascaderEditableTrigger = memo(InnerCascaderEditableTrigger)

type CascaderEditableTriggerProps = {
  isOpen: boolean
  listboxId: string
  activeDescendant?: string
  disabled: boolean
  hasSelection: boolean
  invalid: boolean
  shadowed: boolean
  bordered: boolean
  className?: string
  inputRef: RefObject<HTMLInputElement | null>
  inputText: string
  placeholder: string
  inputClassName?: string
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onInputBlur: () => void
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}
