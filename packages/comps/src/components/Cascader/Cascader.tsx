'use client'

import type { CascaderProps, CascaderRef } from './types'
import { forwardRef, memo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { useFormField } from '../Form/useFormField'
import { CascaderOption } from './CascaderOption'
import {
  useCascaderKeyboard,
  useCascaderMenuStack,
  useCascaderOpen,
  useCascaderPosition,
  useCascaderValue,
} from './hooks'

/** 选项内交互元素选择器默认值：点击命中时不触发选项选中/关闭 */
const DEFAULT_OPTION_CLICK_IGNORE_SELECTOR = 'button, [role="button"], a[href], input, textarea, [contenteditable="true"]'

const InnerCascader = forwardRef<CascaderRef, CascaderProps>(({
  options,
  value,
  defaultValue,
  onChange,
  onClickOutside,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onTriggerClick,
  placement = 'bottom-start',
  offset = 4,
  dropdownHeight = 150,
  dropdownMinWidth = 160,
  className,
  dropdownClassName,
  optionClassName,
  optionContentClassName,
  optionLabelClassName,
  optionCheckIconClassName,
  optionChevronIconClassName,
  disabled = false,
  name,
  error,
  errorMessage,
  dropdownProps,
  clickOutsideIgnoreSelector,
  optionClickIgnoreSelector = DEFAULT_OPTION_CLICK_IGNORE_SELECTOR,
}, ref) => {
  const isControlled = controlledOpen !== undefined
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<string>({
    name,
    value,
    defaultValue: '',
    error,
    errorMessage,
    onChange,
  })

  const { isOpen, setOpen, handleTriggerClick } = useCascaderOpen(
    triggerRef,
    dropdownRef,
    {
      isControlled,
      controlledOpen,
      onOpenChange,
      onClickOutside,
      handleBlur,
      disabled,
      onTriggerClick,
      clickOutsideIgnoreSelector,
    },
    ref,
  )

  const { style, shouldAnimate } = useCascaderPosition(
    triggerRef,
    dropdownRef,
    isOpen,
    { placement, offset },
  )

  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  } = useCascaderMenuStack(options)

  const { internalValue, handleOptionClick } = useCascaderValue(
    options,
    actualValue,
    defaultValue,
    handleChangeVal,
    setOpen,
    disabled,
  )

  const handleKeyDown = useCascaderKeyboard({
    disabled,
    isOpen,
    setOpen,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionClick,
  })

  useEffect(() => {
    if (isOpen)
      resetOnOpen()
  }, [isOpen, resetOnOpen])

  const dropdownContent = isOpen && (
    <AnimateShow
      show={ shouldAnimate }
      ref={ dropdownRef }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ { ...style, zIndex: 50 } }
    >
      <div
        className={ cn(
          'bg-background rounded-2xl shadow-lg flex text-textPrimary',
          dropdownClassName,
        ) }
        { ...dropdownProps }
      >
        {menuStack.map((menuOptions, level) => (
          <div
            key={ level }
            className="overflow-auto border-r border-border last:border-r-0"
            style={ { maxHeight: dropdownHeight } }
          >
            <div className="py-1" style={ { minWidth: `${dropdownMinWidth}px` } }>
              {menuOptions.map((option, idx) => (
                <CascaderOption
                  key={ option.value }
                  option={ option }
                  selected={ internalValue === option.value }
                  highlighted={ idx === (highlightedIndices[level] ?? -1) }
                  onClick={ handleOptionClick }
                  onMouseEnter={ () => handleOptionHover(option, level, idx) }
                  className={ optionClassName }
                  contentClassName={ optionContentClassName }
                  labelClassName={ optionLabelClassName }
                  checkIconClassName={ optionCheckIconClassName }
                  chevronIconClassName={ optionChevronIconClassName }
                  optionClickIgnoreSelector={ optionClickIgnoreSelector }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AnimateShow>
  )

  const triggerProps = {
    ref: triggerRef,
    role: 'combobox' as const,
    tabIndex: disabled
      ? undefined
      : 0,
    className: cn('inline-block', className),
    onKeyDown: handleKeyDown,
  }

  return (
    <>
      {trigger
        ? (
            <div { ...triggerProps } onClick={ handleTriggerClick }>
              {trigger}
            </div>
          )
        : (
            <div { ...triggerProps } />
          )}
      {createPortal(dropdownContent, document.body)}
      {actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          {actualErrorMessage}
        </div>
      )}
    </>
  )
})

InnerCascader.displayName = 'Cascader'

export const Cascader = memo(InnerCascader)
