'use client'

import type { CascaderProps, CascaderRef } from './types'
import { useTheme } from 'hooks'
import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { useFormField } from '../Form/useFormField'
import { CascaderMenu } from './CascaderMenu'
import { CascaderSearch } from './CascaderSearch'
import {
  useCascaderKeyboard,
  useCascaderMenuStack,
  useCascaderOpen,
  useCascaderPosition,
  useCascaderScroll,
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
  } = props
  const isControlled = controlledOpen !== undefined
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')

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

  const flatOptions = useMemo(() => {
    if (!searchable)
      return []

    const result: { label: string, value: string, path: string[] }[] = []
    const traverse = (opts: typeof options, path: string[]) => {
      opts.forEach((opt) => {
        const currentPath = [...path, opt.label as string]
        if (!opt.children || opt.children.length === 0) {
          result.push({
            label: currentPath.join(' / '),
            value: opt.value,
            path: currentPath,
          })
        }
        else {
          traverse(opt.children, currentPath)
        }
      })
    }
    traverse(options, [])
    return result
  }, [options, searchable])

  const filteredOptions = useMemo(() => {
    if (!searchQuery)
      return flatOptions
    return flatOptions.filter(opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [flatOptions, searchQuery])

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

  useCascaderScroll(isOpen, dropdownRef, menuStack)

  useEffect(() => {
    if (isOpen) {
      resetOnOpen()
      setSearchQuery('')
    }
  }, [isOpen, resetOnOpen])

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
        { ...dropdownProps }
      >
        { searchable && (
          <CascaderSearch
            searchQuery={ searchQuery }
            setSearchQuery={ setSearchQuery }
            dropdownHeight={ dropdownHeight }
            filteredOptions={ filteredOptions }
            internalValue={ internalValue }
            handleOptionClick={ handleOptionClick }
          />
        ) }
        { (!searchQuery || !searchable) && menuStack.map((menuOptions, level) => (
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
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      className,
    ),
    onKeyDown: handleKeyDown,
  }

  return (
    <>
      { trigger
        ? (
            <div { ...triggerProps } onClick={ handleTriggerClick }>
              { trigger }
            </div>
          )
        : (
            <div { ...triggerProps } />
          ) }
      { createPortal(dropdownContent, document.body) }
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
