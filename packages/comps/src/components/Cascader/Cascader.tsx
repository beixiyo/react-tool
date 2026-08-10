'use client'

import type { CascaderProps, CascaderRef } from './types'
import { useKeyboardLayer, useTheme } from 'hooks'
import { ChevronDown } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { EmptyIcon } from '../../icons/EmptyIcon'
import { findOption } from '../../utils/optionTree'
import { AnimateShow } from '../Animate'
import { CloseBtn } from '../CloseBtn'
import { useFormField } from '../Form/useFormField'
import { SafePortal } from '../SafePortal'
import { CascaderMenu } from './CascaderMenu'
import { CascaderSearch } from './CascaderSearch'
import {
  useCascaderEditable,
  useCascaderKeyboard,
  useCascaderMenuStack,
  useCascaderOpen,
  useCascaderPosition,
  useCascaderScroll,
  useCascaderSearch,
  useCascaderValue,
} from './hooks'

/** 选项内交互元素选择器默认值：点击命中时不触发选项选中/关闭 */
const DEFAULT_OPTION_CLICK_IGNORE_SELECTOR = 'button, [role="button"], a[href], input, textarea, [contenteditable="true"]'

const InnerCascader = forwardRef<CascaderRef, CascaderProps>((props, ref) => {
  const [theme] = useTheme()
  const {
    options,
    value,
    defaultValue,
    onChange,
    onClickOutside,
    open: controlledOpen,
    onOpenChange,
    trigger,
    clearable = false,
    onClear,
    onTriggerClick,
    placement = 'bottom-start',
    offset = 4,
    dropdownHeight = 150,
    dropdownMinWidth = 160,
    className,
    dropdownClassName,
    menuClassName,
    dropdownStyle,
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
    bordered = theme !== 'light',
    shadowed = true,
    searchable = false,
    editable = false,
    placeholder = 'Select option',
    editableInputClassName,
    triggerMode = 'click',
    hoverCloseDelay,
  } = props
  const isControlled = controlledOpen !== undefined
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [defaultTriggerHovered, setDefaultTriggerHovered] = useState(false)

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<string>({
    name,
    value,
    defaultValue: defaultValue ?? '',
    error,
    errorMessage,
    onChange,
  })

  const {
    isOpen,
    setOpen,
    handleTriggerClick,
    handleTriggerMouseEnter,
    handleTriggerMouseLeave,
    handleDropdownMouseEnter,
    handleDropdownMouseLeave: handleDropdownMouseLeaveHover,
  } = useCascaderOpen(
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
      triggerMode,
      hoverCloseDelay,
    },
    ref,
  )

  const { style, shouldAnimate } = useCascaderPosition(
    triggerRef,
    dropdownRef,
    isOpen,
    { placement, offset },
  )

  useKeyboardLayer({
    active: isOpen,
    keys: ['Escape'],
    priority: typeof dropdownStyle?.zIndex === 'number'
      ? dropdownStyle.zIndex
      : Z.dropdown,
    allowRepeat: false,
    onKeyDown: () => setOpen(false),
  })

  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  } = useCascaderMenuStack(options)

  const isSingleLevel = useMemo(() => {
    return options.every(opt => !opt.children || opt.children.length === 0)
  }, [options])

  const {
    searchQuery,
    setSearchQuery,
    filteredOptions,
  } = useCascaderSearch({ options, searchable })

  const { internalValue, handleOptionClick } = useCascaderValue(
    options,
    actualValue,
    defaultValue,
    handleChangeVal,
    setOpen,
    disabled,
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const {
    inputText,
    highlightedIndex: editableHighlightedIndex,
    setHighlightedIndex: setEditableHighlightedIndex,
    editableFilteredOptions,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown,
    handleOptionSelectEditable,
  } = useCascaderEditable(actualValue, options, handleChangeVal, setOpen)

  const [focusSearchToken, setFocusSearchToken] = useState(0)
  const selectedOption = useMemo(
    () => findOption(options, internalValue),
    [internalValue, options],
  )
  const clearConfig = typeof clearable === 'object'
    ? clearable
    : null
  const canClearDefaultTrigger = !!clearable && !!internalValue && !disabled

  const handleClearDefaultValue = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!canClearDefaultTrigger)
      return

    handleChangeVal('', {} as React.ChangeEvent<HTMLElement>)
    setOpen(false)
    onClear?.()
  }, [canClearDefaultTrigger, handleChangeVal, onClear, setOpen])

  const handleFocusMenuByKeyboard = useCallback(() => {
    const firstLevelOptions = menuStack[0] ?? []
    if (!firstLevelOptions.length)
      return

    setHighlightedIndices((prev) => {
      let idx = prev[0] ?? -1

      if (
        idx < 0
        || idx >= firstLevelOptions.length
        || firstLevelOptions[idx]?.disabled
      ) {
        const firstEnabledIndex = firstLevelOptions.findIndex(opt => !opt.disabled)
        idx = firstEnabledIndex === -1
          ? 0
          : firstEnabledIndex
      }

      return [idx]
    })

    triggerRef.current?.focus()
  }, [menuStack, setHighlightedIndices])

  const handleFocusSearchByKeyboard = useCallback(() => {
    setFocusSearchToken(prev => prev + 1)
  }, [])

  const handleKeyDown = useCascaderKeyboard({
    disabled,
    isOpen,
    setOpen,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionClick,
    onFocusSearchByKeyboard: searchable
      ? handleFocusSearchByKeyboard
      : undefined,
  })

  useCascaderScroll(isOpen, dropdownRef, menuStack)

  useEffect(() => {
    if (isOpen) {
      resetOnOpen()
      setSearchQuery('')
      if (!searchable && !editable) {
        triggerRef.current?.focus()
      }
    }
  }, [isOpen, resetOnOpen, searchable, editable])

  const handleDropdownMouseLeave = () => {
    setHighlightedIndices(prev => prev.map(() => -1))
    handleDropdownMouseLeaveHover()
  }

  const dropdownContent = isOpen && (
    <AnimateShow
      show={ shouldAnimate }
      ref={ dropdownRef }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ { zIndex: Z.dropdown, ...style, ...dropdownStyle } }
    >
      <div
        className={ cn(
          'bg-background overflow-hidden rounded-xl flex text-text',
          shadowed && 'shadow-card',
          bordered && 'border border-border',
          dropdownClassName,
        ) }
        onMouseEnter={ handleDropdownMouseEnter }
        onMouseLeave={ handleDropdownMouseLeave }
        onMouseDown={ editable
          ? (e: React.MouseEvent) => e.preventDefault() // 防止 input blur 早于 option click
          : undefined }
        { ...dropdownProps }
      >
        { editable
          ? editableFilteredOptions.length > 0
            ? (
                <CascaderMenu
                  menuOptions={ editableFilteredOptions }
                  level={ 0 }
                  dropdownHeight={ dropdownHeight }
                  dropdownMinWidth={ dropdownMinWidth }
                  internalValue={ internalValue }
                  highlightedIndices={ [editableHighlightedIndex] }
                  handleOptionClick={ handleOptionSelectEditable }
                  handleOptionHover={ (_option, _level, idx) => setEditableHighlightedIndex(idx) }
                  optionClickIgnoreSelector={ optionClickIgnoreSelector }
                  optionClassName={ optionClassName }
                  optionContentClassName={ optionContentClassName }
                  labelClassName={ optionLabelClassName }
                  checkIconClassName={ optionCheckIconClassName }
                  chevronIconClassName={ optionChevronIconClassName }
                  className={ menuClassName }
                />
              )
            : (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-6 text-text2"
                  style={ { minWidth: `${dropdownMinWidth}px` } }
                >
                  <EmptyIcon size={ 48 } />
                  <span className="text-xs">No matching options</span>
                </div>
              )
          : (
              <>
                { searchable && (
                  <CascaderSearch
                    searchQuery={ searchQuery }
                    setSearchQuery={ setSearchQuery }
                    dropdownHeight={ dropdownHeight }
                    filteredOptions={ filteredOptions }
                    internalValue={ internalValue }
                    handleOptionClick={ handleOptionClick }
                    isSingleLevel={ isSingleLevel }
                    optionClassName={ optionClassName }
                    optionContentClassName={ optionContentClassName }
                    optionLabelClassName={ optionLabelClassName }
                    optionCheckIconClassName={ optionCheckIconClassName }
                    optionChevronIconClassName={ optionChevronIconClassName }
                    onFocusMenuByKeyboard={ handleFocusMenuByKeyboard }
                    focusSearchToken={ focusSearchToken }
                  />
                ) }
                { ((!searchQuery && !isSingleLevel) || !searchable) && menuStack.map((menuOptions, level) => (
                  <CascaderMenu
                    key={ level }
                    menuOptions={ menuOptions }
                    level={ level }
                    dropdownHeight={ dropdownHeight }
                    dropdownMinWidth={ dropdownMinWidth }
                    internalValue={ internalValue }
                    highlightedIndices={ highlightedIndices }
                    handleOptionClick={ handleOptionClick }
                    handleOptionHover={ handleOptionHover }
                    optionClickIgnoreSelector={ optionClickIgnoreSelector }
                    optionClassName={ optionClassName }
                    optionContentClassName={ optionContentClassName }
                    labelClassName={ optionLabelClassName }
                    checkIconClassName={ optionCheckIconClassName }
                    chevronIconClassName={ optionChevronIconClassName }
                    className={ menuClassName }
                  />
                )) }
              </>
            ) }
      </div>
    </AnimateShow>
  )

  const triggerProps = {
    'ref': triggerRef,
    'role': 'combobox' as const,
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox' as const,
    'aria-disabled': disabled || undefined,
    'tabIndex': disabled
      ? undefined
      : 0,
    'className': cn(
      'inline-block',
      disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer',
      className,
    ),
    'onKeyDown': handleKeyDown,
  }

  return (
    <>
      { editable
        ? (
            <div
              ref={ triggerRef }
              role="combobox"
              aria-expanded={ isOpen }
              aria-haspopup="listbox"
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
                onChange={ e => handleInputChange(e.target.value) }
                onFocus={ handleInputFocus }
                onBlur={ handleInputBlur }
                onKeyDown={ handleInputKeyDown }
                disabled={ disabled }
                placeholder={ placeholder }
                className={ cn('min-w-0 flex-1 bg-transparent outline-none placeholder:text-text2', editableInputClassName) }
              />
            </div>
          )
        : trigger
          ? (
              <div
                { ...triggerProps }
                onClick={ handleTriggerClick }
                onMouseEnter={ handleTriggerMouseEnter }
                onMouseLeave={ handleTriggerMouseLeave }
              >
                { trigger }
              </div>
            )
          : (
              <div
                { ...triggerProps }
                onClick={ handleTriggerClick }
                onMouseEnter={ () => {
                  setDefaultTriggerHovered(true)
                  handleTriggerMouseEnter()
                } }
                onMouseLeave={ () => {
                  setDefaultTriggerHovered(false)
                  handleTriggerMouseLeave()
                } }
              >
                <div className={ cn(
                  'flex min-h-9 items-center gap-2 rounded-xl bg-background px-3 py-1.5 text-sm transition-colors hover:bg-background2',
                  shadowed && 'shadow-card',
                  bordered && 'border border-border',
                  isOpen && 'bg-background2',
                  disabled && 'opacity-50',
                ) }>
                  <span className={ cn(
                    'min-w-0 flex-1 truncate',
                    selectedOption
                      ? 'text-text'
                      : 'text-text2',
                  ) }>
                    { selectedOption?.label ?? placeholder }
                  </span>

                  <span className="flex size-5 shrink-0 items-center justify-center">
                    { canClearDefaultTrigger && defaultTriggerHovered
                      ? (
                          <CloseBtn
                            mode="static"
                            size={ 20 }
                            iconSize={ 13 }
                            strokeWidth={ 3 }
                            aria-label="Clear selection"
                            className="rounded-md"
                            onClick={ handleClearDefaultValue }
                          >
                            { clearConfig?.clearIcon }
                          </CloseBtn>
                        )
                      : (
                          <ChevronDown className={ cn(
                            'size-4 text-text2 transition-transform',
                            isOpen && 'rotate-180',
                          ) } />
                        ) }
                  </span>
                </div>
              </div>
            ) }

      <SafePortal>{ dropdownContent }</SafePortal>

      { actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          { actualErrorMessage }
        </div>
      ) }
    </>
  )
})

InnerCascader.displayName = 'Cascader'

export const Cascader = memo(InnerCascader)
