'use client'

import { useKeyboardLayer, useLatestCallback, useLatestRef, useTheme } from 'hooks'
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn, focusElement } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { Z } from '../../constants/z-index'
import { useActiveDescendantScroll } from '../../hooks/useActiveDescendantScroll'
import { useEditable } from '../../hooks/useEditable'
import { useNestedLayerPriority } from '../../hooks/useKeyboardLayerHost'
import { findOption, normalizeHighlightIndex } from '../../utils/optionTree'
import { useFormField } from '../Form/hooks/useFormField'
import { SafePortal } from '../SafePortal'
import {
  useCascaderEditableKeyboard,
  useCascaderKeyboard,
  useCascaderMenuStack,
  useCascaderOpen,
  useCascaderPosition,
  useCascaderScroll,
  useCascaderSearch,
  useCascaderValue,
} from './hooks'
import { CascaderDefaultTrigger } from './subcomponents/CascaderDefaultTrigger'
import { CascaderEditableTrigger } from './subcomponents/CascaderEditableTrigger'
import { CascaderPopup } from './subcomponents/CascaderPopup'
import type { CascaderProps } from './types'

/** 选项内交互元素选择器默认值：点击命中时不触发选项选中/关闭 */
const DEFAULT_OPTION_CLICK_IGNORE_SELECTOR = 'button, [role="button"], a[href], input, textarea, [contenteditable="true"]'

const InnerCascader = ({ ref, ...props }: CascaderProps) => {
  const [theme] = useTheme()
  const {
    options,
    value,
    defaultValue,
    open: controlledOpen,

    trigger,
    clearable = false,
    placement = 'bottom-start',

    onChange,
    onClickOutside,
    onOpenChange,
    onClear,
    onTriggerClick,

    offset = 4,
    dropdownHeight = 150,
    dropdownMinWidth = 160,

    dropdownStyle,
    className,
    dropdownClassName,
    menuClassName,
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
    enableScrollAnimation = true,

    editable = false,
    placeholder = 'Select option',
    editableInputClassName,
    triggerMode = 'click',
    hoverCloseDelay,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  } = props

  const cascaderId = useId().replace(/:/g, '')
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [keyboardFocusArea, setKeyboardFocusArea] = useState<'menu' | 'search' | 'editable'>('menu')

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

  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  } = useCascaderMenuStack(options)

  const isSingleLevel = useMemo(() => {
    return options.every((opt) => !opt.children || opt.children.length === 0)
  }, [options])

  const {
    searchQuery,
    setSearchQuery,
    filteredOptions,
  } = useCascaderSearch({ options, searchable })

  /** 选中关闭前归还即将卸载的搜索焦点；不覆盖 onChange 主动转移到外部的焦点 */
  const setOpenAfterSelect = useLatestCallback((nextOpen: boolean) => {
    const panel = dropdownRef.current
    if (!nextOpen && panel) {
      const activeElement = panel.ownerDocument.activeElement
      /** 鼠标点不可聚焦选项时，输入框可能已先失焦到 BODY */
      if (panel.contains(activeElement) || activeElement === panel.ownerDocument.body) {
        focusElement(triggerRef.current)
      }
    }
    setOpen(nextOpen)
  })

  const { internalValue, handleOptionClick } = useCascaderValue(
    options,
    actualValue,
    handleChangeVal,
    setOpenAfterSelect,
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
  } = useEditable(actualValue, options, handleChangeVal, setOpen)

  /** editable 模式的键盘起点与 aria-activedescendant 共用归一后的高亮 */
  const safeEditableHighlightedIndex = normalizeHighlightIndex(editableFilteredOptions, editableHighlightedIndex)

  const handleEditableKeyDown = useCascaderEditableKeyboard({
    highlightedIndex: safeEditableHighlightedIndex,
    filteredOptions: editableFilteredOptions,
    setHighlightedIndex: setEditableHighlightedIndex,
    handleInputKeyDown,
  })

  const handleKeyboardEscape = useLatestCallback((event: KeyboardEvent) => {
    /**
     * KeyboardLayer 在捕获阶段消费 Escape，editable input 因而不会再收到
     * React 的 onKeyDown；复用生产 hook 的 Escape 分支保留输入回退语义
     */
    if (editable && inputRef.current === event.target) {
      handleInputKeyDown(event as unknown as React.KeyboardEvent<HTMLInputElement>)
      return
    }

    triggerRef.current?.focus()
    setOpen(false)
  })

  /** 嵌在弹窗 / 气泡里时至少压过宿主，否则 Esc 关掉的是宿主而不是这个面板 */
  const layerPriority = useNestedLayerPriority(
    typeof dropdownStyle?.zIndex === 'number'
      ? dropdownStyle.zIndex
      : Z.dropdown,
  )

  useKeyboardLayer({
    active: isOpen && shouldAnimate && !disabled,
    keys: ['Escape'],
    priority: layerPriority,
    allowRepeat: false,
    onKeyDown: handleKeyboardEscape,
  })

  const internalValueRef = useLatestRef(internalValue)
  const [focusSearchToken, setFocusSearchToken] = useState(0)
  const selectedOption = useMemo(
    () => findOption(options, internalValue),
    [internalValue, options],
  )
  const clearConfig = typeof clearable === 'object'
    ? clearable
    : null
  const canClearDefaultTrigger = !!clearable && !!internalValue && !disabled

  const handleClearDefaultValue = useLatestCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!canClearDefaultTrigger) return

    handleChangeVal('', {} as React.ChangeEvent<HTMLElement>)
    setOpen(false)
    onClear?.()
  })

  const handleFocusMenuByKeyboard = useLatestCallback(() => {
    const firstLevelOptions = menuStack[0] ?? []
    if (!firstLevelOptions.length) return

    setKeyboardFocusArea('menu')
    setHighlightedIndices((prev) => {
      let idx = prev[0] ?? -1

      if (
        idx < 0
        || idx >= firstLevelOptions.length
        || firstLevelOptions[idx]?.disabled
      ) {
        const firstEnabledIndex = firstLevelOptions.findIndex((opt) => !opt.disabled)
        idx = firstEnabledIndex
      }

      return [idx]
    })

    triggerRef.current?.focus()
  })

  const handleFocusSearchByKeyboard = useLatestCallback(() => {
    setKeyboardFocusArea('search')
    setFocusSearchToken((prev) => prev + 1)
  })

  const handleSearchFocus = useLatestCallback(() => {
    setKeyboardFocusArea('search')
  })

  const handleEditableInputFocus = useLatestCallback(() => {
    setKeyboardFocusArea('editable')
    handleInputFocus()
  })

  const handleEditableOptionHover = useLatestCallback((
    _option: (typeof editableFilteredOptions)[number],
    _level: number,
    index: number,
  ) => {
    setEditableHighlightedIndex(index)
  })

  /**
   * 打开期间 options 变短或项变 disabled 时，渲染与键盘统一使用归一后的高亮，
   * 避免 aria-activedescendant / 高亮样式指向越界或 disabled 项；-1（无高亮）保持不变
   */
  const safeHighlightedIndices = highlightedIndices.map((index, level) => normalizeHighlightIndex(menuStack[level] ?? [], index))

  const handleKeyDown = useCascaderKeyboard({
    disabled,
    isOpen,
    setOpen,
    menuStack,
    setMenuStack,
    highlightedIndices: safeHighlightedIndices,
    setHighlightedIndices,
    handleOptionClick,
    onFocusSearchByKeyboard: searchable
      ? handleFocusSearchByKeyboard
      : undefined,
  })

  useCascaderScroll(isOpen, dropdownRef, menuStack, enableScrollAnimation)

  useEffect(() => {
    if (isOpen) {
      resetOnOpen({ selectedValue: internalValueRef.current })
      setSearchQuery('')
      setKeyboardFocusArea(
        editable
          ? 'editable'
          : searchable
          ? 'search'
          : 'menu',
      )
      if (!searchable && !editable) {
        triggerRef.current?.focus()
      }
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resetOnOpen, searchable, editable])

  const handleDropdownMouseLeave = () => {
    setHighlightedIndices((prev) => prev.map(() => -1))
    handleDropdownMouseLeaveHover()
  }

  const menuId = (level: number) => `${cascaderId}-menu-${level}`
  const menuOptionIdPrefix = (level: number) => `${menuId(level)}-option`
  const searchListboxId = `${cascaderId}-search`
  const searchOptionIdPrefix = `${searchListboxId}-option`
  const activeMenuLevel = Math.max(0, safeHighlightedIndices.length - 1)
  const activeMenuOptions = menuStack[activeMenuLevel] ?? []
  const activeMenuIndex = safeHighlightedIndices[activeMenuLevel] ?? -1
  const activeMenuOption = activeMenuOptions[activeMenuIndex]
  const activeMenuOptionId = activeMenuOption && !activeMenuOption.disabled
    ? `${menuOptionIdPrefix(activeMenuLevel)}-${activeMenuIndex}`
    : undefined
  const editableActiveOption = editableFilteredOptions[safeEditableHighlightedIndex]
  const editableActiveDescendant = editableActiveOption && !editableActiveOption.disabled
    ? `${menuOptionIdPrefix(0)}-${safeEditableHighlightedIndex}`
    : undefined
  const triggerListboxId = keyboardFocusArea === 'search' && searchable
    ? searchListboxId
    : menuId(activeMenuLevel)
  const triggerActiveDescendant = keyboardFocusArea === 'menu'
    ? activeMenuOptionId
    : undefined

  const scrollActiveOption = useActiveDescendantScroll({
    enabled: isOpen && shouldAnimate && !disabled && (editable || keyboardFocusArea === 'menu'),
    activeDescendantId: editable
      ? editableActiveDescendant
      : triggerActiveDescendant,
    panelRef: dropdownRef,
    behavior: enableScrollAnimation
      ? 'smooth'
      : 'instant',
  })

  const dropdownContent = isOpen && (
    <CascaderPopup
      dropdownRef={ dropdownRef }
      shouldAnimate={ shouldAnimate }
      positionStyle={ style }
      dropdownStyle={ dropdownStyle }
      dropdownProps={ dropdownProps }
      dropdownClassName={ dropdownClassName }
      shadowed={ shadowed }
      bordered={ bordered }
      dropdownHeight={ dropdownHeight }
      dropdownMinWidth={ dropdownMinWidth }
      menuClassName={ menuClassName }
      internalValue={ internalValue }
      optionClickIgnoreSelector={ optionClickIgnoreSelector }
      editable={ editable }
      editableFilteredOptions={ editableFilteredOptions }
      editableHighlightedIndex={ safeEditableHighlightedIndex }
      handleEditableOptionClick={ handleOptionSelectEditable }
      handleEditableOptionHover={ handleEditableOptionHover }
      searchable={ searchable }
      searchQuery={ searchQuery }
      setSearchQuery={ setSearchQuery }
      filteredOptions={ filteredOptions }
      isSingleLevel={ isSingleLevel }
      handleOptionClick={ handleOptionClick }
      onFocusMenuByKeyboard={ handleFocusMenuByKeyboard }
      focusSearchToken={ focusSearchToken }
      enableScrollAnimation={ enableScrollAnimation }
      searchListboxId={ searchListboxId }
      searchOptionIdPrefix={ searchOptionIdPrefix }
      disabled={ disabled }
      onSearchFocus={ handleSearchFocus }
      menuStack={ menuStack }
      highlightedIndices={ safeHighlightedIndices }
      handleOptionHover={ handleOptionHover }
      getMenuId={ menuId }
      getMenuOptionIdPrefix={ menuOptionIdPrefix }
      handleDropdownMouseEnter={ handleDropdownMouseEnter }
      handleDropdownMouseLeave={ handleDropdownMouseLeave }
      optionClassName={ optionClassName }
      optionContentClassName={ optionContentClassName }
      optionLabelClassName={ optionLabelClassName }
      optionCheckIconClassName={ optionCheckIconClassName }
      optionChevronIconClassName={ optionChevronIconClassName }
    />
  )

  const triggerProps = {
    role: 'combobox' as const,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox' as const,
    'aria-controls': isOpen
      ? triggerListboxId
      : undefined,
    'aria-activedescendant': isOpen
      ? triggerActiveDescendant
      : undefined,
    'aria-autocomplete': searchable
      ? 'list' as const
      : undefined,
    'aria-disabled': disabled || undefined,
    [DATA_ATTR.state]: isOpen,
    [DATA_ATTR.selected]: Boolean(selectedOption),
    [DATA_ATTR.disabled]: disabled,
    [DATA_ATTR.invalid]: Boolean(actualError),
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
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(event)
      if (event.defaultPrevented) scrollActiveOption()
    },
  }

  return (
    <>
      { editable
        ? (
          <CascaderEditableTrigger
            ref={ triggerRef }
            isOpen={ isOpen }
            listboxId={ menuId(0) }
            activeDescendant={ editableActiveDescendant }
            disabled={ disabled }
            hasSelection={ Boolean(selectedOption) }
            invalid={ Boolean(actualError) }
            className={ className }
            inputRef={ inputRef }
            inputText={ inputText }
            placeholder={ placeholder }
            ariaLabel={ ariaLabel }
            ariaLabelledby={ ariaLabelledby }
            inputClassName={ editableInputClassName }
            onInputChange={ handleInputChange }
            onInputFocus={ handleEditableInputFocus }
            onInputBlur={ handleInputBlur }
            onInputKeyDown={ (event) => {
              handleEditableKeyDown(event)
              if (event.defaultPrevented) scrollActiveOption()
            } }
          />
        )
        : trigger
        ? (
          <div
            { ...triggerProps }
            ref={ triggerRef }
            onClick={ handleTriggerClick }
            onMouseEnter={ handleTriggerMouseEnter }
            onMouseLeave={ handleTriggerMouseLeave }
          >
            { trigger }
          </div>
        )
        : (
          <CascaderDefaultTrigger
            ref={ triggerRef }
            triggerProps={ triggerProps }
            isOpen={ isOpen }
            disabled={ disabled }
            selectedLabel={ selectedOption?.label }
            hasSelection={ !!selectedOption }
            placeholder={ placeholder }
            canClear={ canClearDefaultTrigger }
            clearIcon={ clearConfig?.clearIcon }
            onClear={ handleClearDefaultValue }
            onTriggerClick={ handleTriggerClick }
            onTriggerMouseEnter={ handleTriggerMouseEnter }
            onTriggerMouseLeave={ handleTriggerMouseLeave }
          />
        ) }

      <SafePortal>{ dropdownContent }</SafePortal>

      { actualError && actualErrorMessage && (
        <div className="text-danger mt-1 text-xs">
          { actualErrorMessage }
        </div>
      ) }
    </>
  )
}

InnerCascader.displayName = 'Cascader'

export const Cascader = memo(InnerCascader)
