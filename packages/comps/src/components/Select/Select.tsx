'use client'

import type React from 'react'
import type { SelectProps } from './types'
import { useTheme } from 'hooks'
import { ChevronDown, Inbox, Loader2, Search } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { findLabel, findOption } from '../../utils/optionTree'
import { CloseBtn } from '../CloseBtn'
import { useFormField } from '../Form/useFormField'
import { Input } from '../Input'
import { useSelectEditable, useSelectKeyboard, useSelectMenuStack, useSelectOpen } from './hooks'
import { SelectOption } from './SelectOption'

function InnerSelect<T extends string | string[] = string>(props: SelectProps<T>) {
  const [theme] = useTheme()
  const {
    options,
    value,
    defaultValue,
    onChange,
    onClick,
    onClickOutside,

    className,
    placeholderClassName,
    optionClassName,
    optionContentClassName,
    optionLabelClassName,
    optionCheckIconClassName,
    optionChevronIconClassName,
    placeholder = 'Select option',
    placeholderIcon,
    prefixIcon,
    clearable = false,
    onClear,
    dropdownHeight = 150,
    dropdownMaxHeight,

    showEmpty = true,
    showDownArrow = true,
    disabled = false,
    loading = false,
    multiple = false,
    rotate = true,
    maxSelect,
    searchable = false,
    required = false,
    editable = false,
    editableInputClassName,
    onSearch,
    renderOptionExtra,

    name,
    error,
    errorMessage,
    bordered = theme !== 'light',
    shadowed = true,
  } = props

  const isCascading = useMemo(() => options.some(opt => opt.children && opt.children.length > 0), [options])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLabel, setCurrentLabel] = useState<React.ReactNode>('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isTriggerHovered, setIsTriggerHovered] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<T>({
    name,
    value,
    defaultValue: (defaultValue ?? (multiple
      ? []
      : '')) as T,
    error,
    errorMessage,
    onChange,
  })

  const { isOpen, setIsOpen } = useSelectOpen(containerRef, {
    onClickOutside,
    handleBlur,
  })

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
  } = useSelectEditable(actualValue as string | undefined, options, handleChangeVal as any, setIsOpen)

  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetHighlight,
  } = useSelectMenuStack(options)

  const [internalValue, setInternalValue] = useState<T>(() => {
    if (actualValue !== undefined) {
      return Array.isArray(actualValue)
        ? actualValue
        : [actualValue] as T
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue] as T
    }
    return [] as unknown as T
  })

  useEffect(() => {
    if (actualValue !== undefined) {
      const values = Array.isArray(actualValue)
        ? actualValue
        : [actualValue] as T
      setInternalValue(values)
      if (isCascading && values.length > 0) {
        setCurrentLabel(findLabel(options, (values as string[])[0]))
      }
    }
  }, [actualValue, isCascading, options])

  const filteredOptions = useMemo(() => {
    if (isCascading)
      return options
    return options.filter(option =>
      option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [options, searchQuery, isCascading])

  useEffect(() => {
    if (isOpen) {
      if (isCascading) {
        resetHighlight()
      }
      else {
        const first = filteredOptions.findIndex(opt => !opt.disabled)
        setHighlightedIndex(first >= 0
          ? first
          : -1)
      }
    }
    else {
      setHighlightedIndex(-1)
      if (searchQuery) {
        setSearchQuery('')
        onSearch?.('')
      }
    }
  }, [isOpen, isCascading, filteredOptions, resetHighlight])

  const handleOptionClick = useCallback((optionValue: string) => {
    if (disabled)
      return

    if (isCascading) {
      const option = findOption(options, optionValue)
      if (option && !option.children) {
        setInternalValue([optionValue] as T)
        setCurrentLabel(option.label)
        handleChangeVal(optionValue as T, {} as any)
        setIsOpen(false)
      }
      return
    }

    const newValues = multiple
      ? internalValue.includes(optionValue)
        ? (internalValue as any[]).filter(v => v !== optionValue)
        : maxSelect && internalValue.length >= maxSelect
          ? internalValue
          : [...internalValue, optionValue]
      : [optionValue]

    if (!multiple)
      setIsOpen(false)

    setInternalValue(newValues as T)
    handleChangeVal((multiple
      ? newValues
      : newValues[0]) as T, {} as any)
  }, [disabled, multiple, maxSelect, handleChangeVal, internalValue, isCascading, options, setIsOpen])

  const handleKeyDown = useSelectKeyboard({
    disabled,
    loading,
    isOpen,
    setIsOpen,
    isCascading,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    highlightedIndex,
    setHighlightedIndex,
    filteredOptions,
    handleOptionClick,
  })

  const selectedLabels = useMemo(() => {
    if (isCascading) {
      return currentLabel
        ? [currentLabel]
        : []
    }
    return (internalValue as any[])
      .map(val => findOption(options, val)?.label)
      .filter(Boolean)
  }, [internalValue, options, isCascading, currentLabel])

  const clearConfig = typeof clearable === 'object'
    ? clearable
    : null
  const canClear = !!clearable && !editable && !disabled && !loading && selectedLabels.length > 0

  const handleClear = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!canClear)
      return

    setInternalValue([] as unknown as T)
    setCurrentLabel('')
    handleChangeVal((multiple
      ? []
      : '') as T, {} as any)
    setIsOpen(false)
    onClear?.()
  }, [canClear, handleChangeVal, multiple, onClear, setIsOpen])

  const renderDropdown = () => {
    if (isCascading) {
      return (
        <div
          className={ cn(
            'absolute w-auto mt-1 bg-background rounded-xl z-dropdown flex text-text',
            'transition-all duration-200 ease-in-out origin-top',
            shadowed && 'shadow-card',
            bordered && 'border border-border',
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none',
          ) }
        >
          { menuStack.map((menuOptions, level) => (
            <div
              key={ level }
              className="overflow-auto"
              style={ { maxHeight: dropdownHeight } }
            >
              <div className="py-1" style={ { minWidth: '10rem' } }>
                { menuOptions.map((option, idx) => (
                  <SelectOption
                    key={ option.value }
                    option={ option }
                    selected={ internalValue.includes(option.value) }
                    highlighted={ idx === (highlightedIndices[level] ?? -1) }
                    onClick={ handleOptionClick }
                    onMouseEnter={ () => {
                      handleOptionHover(option, level, idx)
                    } }
                    renderExtra={ renderOptionExtra }
                    className={ optionClassName }
                    contentClassName={ optionContentClassName }
                    labelClassName={ optionLabelClassName }
                    checkIconClassName={ optionCheckIconClassName }
                    chevronIconClassName={ optionChevronIconClassName }
                  />
                )) }
              </div>
            </div>
          )) }
        </div>
      )
    }

    return (
      <div
        className={ cn(
          'absolute w-full mt-1 bg-background rounded-lg z-dropdown overflow-auto text-text',
          'transition-all duration-200 ease-in-out origin-top',
          shadowed && 'shadow-card',
          bordered && 'border border-border',
          isOpen
            ? 'opacity-100 scale-y-100 translate-y-0'
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none',
        ) }
        style={ dropdownMaxHeight != null
          ? { maxHeight: dropdownMaxHeight, overflow: 'auto' }
          : { height: dropdownHeight, overflow: 'auto' } }
        onMouseDown={ editable
          ? (e: React.MouseEvent) => e.preventDefault() // 防止 input blur 早于 option click
          : undefined }
      >
        { searchable && !isCascading && (
          <div className="border-b border-border p-2">
            <Input
              size="sm"
              variant="underlined"
              prefix={ <Search size={ 16 } /> }
              placeholder="Search..."
              value={ searchQuery }
              onChange={ (query) => { setSearchQuery(query); onSearch?.(query) } }
              onClick={ e => e.stopPropagation() }
              onKeyDown={ e => e.stopPropagation() }
            />
          </div>
        ) }

        { (editable
          ? editableFilteredOptions
          : filteredOptions).map((option, idx) => (
          <SelectOption
            key={ option.value }
            option={ option }
            selected={ internalValue.includes(option.value) }
            highlighted={ editable
              ? idx === editableHighlightedIndex
              : idx === highlightedIndex }
            onClick={ editable
              ? handleOptionSelectEditable
              : handleOptionClick }
            onMouseEnter={ () => editable
              ? setEditableHighlightedIndex(idx)
              : setHighlightedIndex(idx) }
            renderExtra={ renderOptionExtra }
            className={ optionClassName }
            contentClassName={ optionContentClassName }
            labelClassName={ optionLabelClassName }
            checkIconClassName={ optionCheckIconClassName }
            chevronIconClassName={ optionChevronIconClassName }
          />
        )) }

        { (editable
          ? editableFilteredOptions
          : filteredOptions).length === 0 && showEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-text2">
            <Inbox size={ 48 } />
            <span className="text-xs">No matching options</span>
          </div>
        ) }
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="relative"
        ref={ containerRef }
        role="combobox"
        aria-expanded={ isOpen }
        aria-haspopup="listbox"
        aria-disabled={ disabled || undefined }
        tabIndex={ disabled || editable
          ? undefined
          : 0 }
        onClick={ () => {
          if (disabled)
            return
          onClick?.()
        } }
        onKeyDown={ handleKeyDown }
      >
        <div
          className={ cn(
            'flex min-h-9 items-center justify-between rounded-xl bg-background px-3 py-1.5 text-sm text-text',
            'transition-colors duration-200 ease-in-out',
            shadowed && 'shadow-card',
            bordered && 'border border-border',
            disabled
              ? 'cursor-not-allowed bg-background2 opacity-50'
              : editable
                ? 'cursor-text'
                : 'cursor-pointer hover:bg-background2',
            isOpen && 'bg-background2',
            actualError
              ? 'border-danger'
              : '',
            { 'cursor-wait': loading },
            className,
          ) }
          onClick={ editable
            ? undefined
            : () => !disabled && !loading && setIsOpen(!isOpen) }
          onMouseEnter={ () => setIsTriggerHovered(true) }
          onMouseLeave={ () => setIsTriggerHovered(false) }
        >
          <div className="flex flex-1 items-center gap-2 min-w-0">
            { prefixIcon && <span className="flex shrink-0 items-center">{ prefixIcon }</span> }
            { loading
              ? <Loader2 className="h-5 w-5 animate-spin text-text2" />
              : editable
                ? (
                    <input
                      value={ inputText }
                      onChange={ e => handleInputChange(e.target.value) }
                      onFocus={ handleInputFocus }
                      onBlur={ handleInputBlur }
                      onKeyDown={ handleInputKeyDown }
                      disabled={ disabled }
                      placeholder={ placeholder }
                      className={ cn('bg-transparent outline-none w-full min-w-0', editableInputClassName) }
                    />
                  )
                : selectedLabels.length > 0
                  ? <span className="truncate">
                      { multiple
                        ? selectedLabels.join(', ')
                        : selectedLabels[0] }
                    </span>
                  : <div className={ cn('flex items-center gap-2', { 'mr-2': !!placeholderIcon }) }>
                      <span className={ cn('mr-2 select-none text-text2', placeholderClassName) }>
                        { placeholder }
                        { required && <span className="ml-1 text-danger">*</span> }
                      </span>
                      { placeholderIcon && <>{ placeholderIcon }</> }
                    </div> }
          </div>

          { (showDownArrow || (canClear && isTriggerHovered)) && (
            <span className="flex size-5 shrink-0 items-center justify-center">
              { canClear && isTriggerHovered
                ? (
                    <CloseBtn
                      mode="static"
                      size={ 20 }
                      iconSize={ 13 }
                      strokeWidth={ 3 }
                      aria-label="Clear selection"
                      className="rounded-md"
                      onClick={ handleClear }
                    >
                      { clearConfig?.clearIcon }
                    </CloseBtn>
                  )
                : showDownArrow && (
                  <ChevronDown
                    className={ cn(
                      'size-4 transform transition-transform duration-200 ease-in-out text-text2',
                      isOpen && rotate
                        ? 'rotate-180'
                        : 'rotate-0',
                    ) }
                  />
                ) }
            </span>
          ) }
        </div>

        { renderDropdown() }
      </div>

      { actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
}

InnerSelect.displayName = 'Select'

export const Select = memo(InnerSelect) as typeof InnerSelect
