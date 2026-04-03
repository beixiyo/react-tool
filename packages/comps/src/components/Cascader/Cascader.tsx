'use client'

import type { CascaderProps, CascaderRef } from './types'
import { useTheme } from 'hooks'
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { EmptyIcon } from '../../icons/EmptyIcon'
import { AnimateShow } from '../Animate'
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
    bordered = theme !== 'light',
    searchable = false,
    editable = false,
    placeholder,
    editableInputClassName,
  } = props
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
    /** 鼠标移出整体下拉面板时，仅清空各级高亮，不关闭/重置子级 */
    setHighlightedIndices(prev => prev.map(() => -1))
  }

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
          'bg-background rounded-xl shadow-card flex text-text',
          bordered && 'border border-border',
          dropdownClassName,
        ) }
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
                  />
                )) }
              </>
            ) }
      </div>
    </AnimateShow>
  )

  const triggerProps = {
    ref: triggerRef,
    role: 'combobox' as const,
    tabIndex: disabled
      ? undefined
      : 0,
    className: cn(
      'inline-block',
      disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer',
      className,
    ),
    onKeyDown: handleKeyDown,
  }

  return (
    <>
      { editable
        ? (
            <div
              ref={ triggerRef }
              role="combobox"
              className={ cn('inline-block', disabled
                ? 'cursor-not-allowed'
                : 'cursor-text', className) }
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
                className={ cn('bg-transparent outline-none w-full', editableInputClassName) }
              />
            </div>
          )
        : trigger
          ? (
              <div { ...triggerProps } onClick={ handleTriggerClick }>
                { trigger }
              </div>
            )
          : (
              <div { ...triggerProps } />
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
