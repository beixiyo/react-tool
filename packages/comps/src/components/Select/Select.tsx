'use client'

import { useKeyboardLayer, useLatestCallback, useLatestRef, useTheme } from 'hooks'
import { ChevronDown, Loader2 } from 'lucide-react'
import type React from 'react'
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { Z } from '../../constants/z-index'
import { useActiveDescendantScroll } from '../../hooks/useActiveDescendantScroll'
import { useEditable } from '../../hooks/useEditable'
import { useNestedLayerPriority } from '../../hooks/useKeyboardLayerHost'
import { useAriaT } from '../../i18n'
import { findOption, getEnabledBoundaryIndex, getNextEnabledIndex, normalizeHighlightIndex } from '../../utils/optionTree'
import { DropdownPanelFrame } from '../Animate/subcomponents/DropdownPanelFrame'
import { useCascaderMenuStack } from '../Cascader/hooks/useCascaderMenuStack'
import { CloseBtn } from '../CloseBtn'
import { useFormField } from '../Form/hooks/useFormField'
import { SafePortal } from '../SafePortal'
import type { SizeTransitionTag } from '../SizeTransition'
import { useSelectDropdownLayout, useSelectKeyboard, useSelectOpen } from './hooks'
import { SelectCascadePanel } from './subcomponents/SelectCascadePanel'
import { SelectListPanel } from './subcomponents/SelectListPanel'
import type { ListboxNameProps, Option, SelectProps, SelectRenderContext } from './types'

/** 下拉面板默认最大高度，内容不足时自动缩小 */
const DEFAULT_DROPDOWN_MAX_HEIGHT = 200

function InnerSelect<T extends string | string[] = string, Tag extends SizeTransitionTag = 'div'>(props: SelectProps<T, Tag>) {
  const t = useAriaT()
  const [theme] = useTheme()
  const {
    options,
    value,
    defaultValue,
    onChange,
    onClick,
    onClickOutside,
    open,
    defaultOpen,
    onOpenChange,
    label,
    labelClassName,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,

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
    dropdownHeight,
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
    dropdownClassName,
    dropdownMotion,
    onSearch,
    renderOptionExtra,
    renderValue,
    renderDropdownFooter,
    dropdownFooterScroll = true,

    name,
    error,
    errorMessage,
    bordered = theme !== 'light',
    shadowed = true,
  } = props

  const isCascading = useMemo(() => options.some((opt) => opt.children && opt.children.length > 0), [options])
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isTriggerHovered, setIsTriggerHovered] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  /** 键盘打开时记录初始高亮意图：方向键决定首 / 尾可用项，typeahead 直接指定下标 */
  const pendingOpenRef = useRef<{ direction: 1 | -1; index?: number } | null>(null)
  const selectId = useId().replaceAll(':', '')
  const labelId = `${selectId}-label`

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

  const { isOpen, setIsOpen } = useSelectOpen(containerRef, panelRef, {
    open,
    defaultOpen,
    onOpenChange,
    onClickOutside,
    handleBlur,
  })

  /** 面板渲染在 Portal 里，嵌在弹窗里时层级与键盘优先级都要压过宿主，否则被弹窗盖住、Esc 关掉的是整个弹窗 */
  const layerPriority = useNestedLayerPriority(Z.dropdown)

  /** 方向、限高、等宽与坐标统一由一次测量决定；containerRef 内只有触发器（面板在 Portal 里），其矩形即触发器矩形 */
  const fixedDropdownHeight = !isCascading && dropdownMaxHeight == null
    ? dropdownHeight
    : undefined
  const dropdownLayout = useSelectDropdownLayout(containerRef, panelRef, {
    open: isOpen,
    heightScope: isCascading
      ? 'listbox'
      : 'panel',
    maxHeight: dropdownMaxHeight ?? dropdownHeight ?? DEFAULT_DROPDOWN_MAX_HEIGHT,
    fixedHeight: fixedDropdownHeight,
  })
  const panelOnTop = dropdownLayout.side === 'top'

  useKeyboardLayer({
    active: isOpen && !disabled && !loading,
    keys: ['Escape'],
    priority: layerPriority,
    allowRepeat: false,
    when: (event) => {
      const target = event.target as HTMLElement | null
      return target?.tagName !== 'INPUT' && target?.tagName !== 'BUTTON'
    },
    onKeyDown: () => setIsOpen(false),
  })

  /**
   * 面板关闭后不保留在 DOM 中可见，焦点若仍在面板内（如搜索框）就会落到不可见元素上
   * 此时把焦点还给触发器，焦点已被移到面板外时不干预
   */
  useEffect(() => {
    if (isOpen) return

    const panel = panelRef.current
    const activeElement = document.activeElement
    if (!panel || !activeElement || !panel.contains(activeElement)) return

    containerRef.current?.focus({ preventScroll: true })
  }, [isOpen])

  const openSelect = useLatestCallback((direction: 1 | -1, index?: number) => {
    pendingOpenRef.current = { direction, index }
    setIsOpen(true)
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
  } = useEditable(actualValue as string | undefined, options, handleChangeVal as any, setIsOpen)

  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  } = useCascaderMenuStack(options)

  /**
   * 选中值只从 actualValue 派生，不另存一份乐观状态：
   * 非受控 / 表单态由 useFormField 持有并在 handleChangeVal 里更新；
   * 受控态由父级决定，父级收到 onChange 后不改 value（例如二次确认被取消）时，显示值必须留在原值
   */
  const internalValue = useMemo<T>(() => {
    if (actualValue === undefined) return [] as unknown as T
    return (Array.isArray(actualValue)
      ? actualValue
      : [actualValue]) as T
  }, [actualValue])

  const filteredOptions = useMemo(() => {
    if (isCascading) return options
    return filterOptionsByQuery(options, searchQuery)
  }, [options, searchQuery, isCascading])

  /** 开关切换时才需要读取的值，放进 ref，避免选中 / 输入等变化把高亮重置回初始位置 */
  const openStateRef = useLatestRef({ filteredOptions, internalValue, searchQuery, onSearch })

  useEffect(() => {
    const { filteredOptions, internalValue, searchQuery, onSearch } = openStateRef.current

    if (!isOpen) {
      setHighlightedIndex(-1)
      if (searchQuery) {
        setSearchQuery('')
        onSearch?.('')
      }
      return
    }

    const pending = pendingOpenRef.current
    pendingOpenRef.current = null

    if (isCascading) {
      resetOnOpen({ direction: pending?.direction, index: pending?.index })
      return
    }

    setHighlightedIndex(
      pending?.index !== undefined && pending.index >= 0
        ? pending.index
        : getInitialHighlightIndex(filteredOptions, internalValue as string[], pending?.direction),
    )
  }, [isOpen, isCascading, openStateRef, resetOnOpen])

  const handleSearchChange = useLatestCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
    /** 过滤结果变化后高亮回到已选项或首个可用项 */
    setHighlightedIndex(getInitialHighlightIndex(filterOptionsByQuery(options, query), internalValue as string[]))
  })

  const handleOptionClick = useCallback(
    (optionValue: string) => {
      if (disabled) return

      if (isCascading) {
        const option = findOption(options, optionValue)
        if (option && !option.children) {
          handleChangeVal(optionValue as T, {} as any)
          setIsOpen(false)
        }
        return
      }

      const newValues = multiple
        ? internalValue.includes(optionValue)
          ? (internalValue as any[]).filter((v) => v !== optionValue)
          : maxSelect && internalValue.length >= maxSelect
          ? internalValue
          : [...internalValue, optionValue]
        : [optionValue]

      if (!multiple) setIsOpen(false)

      handleChangeVal(
        (multiple
          ? newValues
          : newValues[0]) as T,
        {} as any,
      )
    },
    [disabled, multiple, maxSelect, handleChangeVal, internalValue, isCascading, options, setIsOpen],
  )

  /**
   * 打开期间 options 变短或项变 disabled 时，渲染与键盘统一使用归一后的高亮，
   * 避免 aria-activedescendant / 高亮样式指向越界或 disabled 项；-1（无高亮）保持不变
   */
  const safeHighlightedIndex = normalizeHighlightIndex(filteredOptions, highlightedIndex)
  const safeEditableHighlightedIndex = normalizeHighlightIndex(editableFilteredOptions, editableHighlightedIndex)
  const safeHighlightedIndices = highlightedIndices.map((index, level) => normalizeHighlightIndex(menuStack[level] ?? [], index))

  const handleKeyDown = useSelectKeyboard({
    disabled,
    loading,
    isOpen,
    openSelect,
    isCascading,
    typeahead: !editable && (isCascading || !searchable),
    rootOptions: options,
    menuStack,
    setMenuStack,
    highlightedIndices: safeHighlightedIndices,
    setHighlightedIndices,
    highlightedIndex: safeHighlightedIndex,
    setHighlightedIndex,
    filteredOptions,
    handleOptionClick,
  })

  const selectedLabels = useMemo(
    () =>
      (internalValue as string[])
        .map((val) => findOption(options, val)?.label)
        .filter(Boolean),
    [internalValue, options],
  )

  const renderContext: SelectRenderContext = {
    selectedValues: internalValue as string[],
    selectedLabels,
    maxReached: Boolean(multiple && maxSelect && internalValue.length >= maxSelect),
    isOpen,
    close: () => setIsOpen(false),
  }
  const customValue = !editable && !loading
    ? renderValue?.(renderContext)
    : undefined

  const clearConfig = typeof clearable === 'object'
    ? clearable
    : null
  const canClear = !!clearable && !editable && !disabled && !loading && selectedLabels.length > 0

  const handleClear = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!canClear) return

    handleChangeVal(
      (multiple
        ? []
        : '') as T,
      {} as any,
    )
    setIsOpen(false)
    onClear?.()
  }, [canClear, handleChangeVal, multiple, onClear, setIsOpen])

  const getOptionId = (level: number, index: number) => `${selectId}-option-${level}-${index}`
  const getListboxId = (level: number) => `${selectId}-listbox-${level}`
  const listboxIds = isCascading
    ? menuStack.map((_, level) => getListboxId(level)).join(' ')
    : getListboxId(0)

  const activeLevel = isCascading
    ? safeHighlightedIndices.length - 1
    : 0
  const activeIndex = isCascading
    ? safeHighlightedIndices[activeLevel] ?? -1
    : editable
    ? safeEditableHighlightedIndex
    : safeHighlightedIndex

  const activeOptions = isCascading
    ? menuStack[activeLevel] ?? []
    : editable
    ? editableFilteredOptions
    : filteredOptions
  const activeOption = activeOptions[activeIndex]

  const activeDescendantId = isOpen && activeOption && !activeOption.disabled && activeIndex >= 0
    ? getOptionId(activeLevel, activeIndex)
    : undefined

  const scrollActiveOption = useActiveDescendantScroll({
    enabled: isOpen && !disabled && !loading,
    activeDescendantId,
    panelRef,
  })

  /** 触发器的名称来源：调用方 aria-labelledby > 内置 label > aria-label；listbox 与之同名 */
  const triggerLabelledby = ariaLabelledby ?? (label
    ? labelId
    : undefined)
  const listboxNameProps: ListboxNameProps = triggerLabelledby
    ? { 'aria-labelledby': triggerLabelledby }
    : { 'aria-label': ariaLabel }

  /**
   * 搜索框按 combobox 处理导航：焦点留在输入框，高亮经 aria-activedescendant 同步；
   * Escape 由面板关闭，Tab 不拦截
   */
  const handleSearchKeyDown = useLatestCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const list = filteredOptions
    let next = safeHighlightedIndex

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        next = getNextEnabledIndex(
          list,
          safeHighlightedIndex,
          event.key === 'ArrowDown'
            ? 1
            : -1,
        )
        break
      case 'Home':
      case 'End':
        next = getEnabledBoundaryIndex(
          list,
          event.key === 'Home'
            ? 1
            : -1,
        )
        break
      case 'Enter': {
        event.preventDefault()
        const option = list[safeHighlightedIndex]
        if (option && !option.disabled) handleOptionClick(option.value)
        return
      }
      default:
        return
    }

    event.preventDefault()
    if (next !== safeHighlightedIndex) setHighlightedIndex(next)
  })

  const triggerStateProps = {
    [DATA_ATTR.state]: isOpen
      ? 'open'
      : 'closed',
    [DATA_ATTR.selected]: selectedLabels.length > 0,
    [DATA_ATTR.disabled]: disabled,
    [DATA_ATTR.invalid]: Boolean(actualError),
  }

  const panelClassName = cn(
    'rounded-[20px] p-2 text-text',
    isOpen && 'pointer-events-auto',
    bordered && 'border border-transparent',
    dropdownClassName,
  )
  const panelStyle = dropdownLayout.panelStyle
  const optionClassNames = {
    className: optionClassName,
    contentClassName: optionContentClassName,
    labelClassName: optionLabelClassName,
    checkIconClassName: optionCheckIconClassName,
    chevronIconClassName: optionChevronIconClassName,
  }

  const dropdown = isCascading
    ? (
      <SelectCascadePanel
        panelRef={ panelRef }
        open={ isOpen }
        className={ panelClassName }
        style={ panelStyle }
        listboxMaxHeight={ dropdownLayout.listboxMaxHeight }
        getListboxId={ getListboxId }
        getOptionId={ getOptionId }
        listboxNameProps={ listboxNameProps }
        menuStack={ menuStack }
        selectedValues={ internalValue as string[] }
        highlightedIndices={ safeHighlightedIndices }
        multiple={ multiple }
        onOptionClick={ handleOptionClick }
        onOptionHover={ handleOptionHover }
        onMouseLeave={ () => {
          /** 鼠标移出整个级联面板后收起子菜单并清掉悬停高亮，已选项由 selected 样式表达 */
          setMenuStack([options])
          setHighlightedIndices([-1])
        } }
        renderOptionExtra={ renderOptionExtra }
        optionClassNames={ optionClassNames }
      />
    )
    : (
      <SelectListPanel
        panelRef={ panelRef }
        open={ isOpen }
        className={ panelClassName }
        style={ panelStyle }
        listboxId={ getListboxId(0) }
        listboxNameProps={ listboxNameProps }
        getOptionId={ (index) => getOptionId(0, index) }
        options={ activeOptions }
        selectedValues={ internalValue as string[] }
        highlightedIndex={ activeIndex }
        multiple={ multiple }
        preventBlur={ editable }
        search={ searchable
          ? {
            query: searchQuery,
            onChange: (query) => {
              handleSearchChange(query)
              scrollActiveOption()
            },
            placeholder: 'Search...',
            activeDescendantId,
            onKeyDown: (event) => {
              handleSearchKeyDown(event)
              if (event.defaultPrevented) scrollActiveOption()
            },
          }
          : undefined }
        showEmpty={ showEmpty }
        footer={ renderDropdownFooter?.(renderContext) }
        footerScrollable={ dropdownFooterScroll }
        onOptionClick={ editable
          ? handleOptionSelectEditable
          : handleOptionClick }
        onOptionHover={ editable
          ? setEditableHighlightedIndex
          : setHighlightedIndex }
        onListMouseLeave={ () => {
          /** 鼠标移出列表后清掉悬停高亮，回落到已选项（与打开时的初始高亮一致） */
          const selectedIndex = activeOptions.findIndex((opt) => !opt.disabled && internalValue.includes(opt.value))
          if (editable) setEditableHighlightedIndex(selectedIndex)
          else setHighlightedIndex(selectedIndex)
        } }
        onClose={ () => setIsOpen(false) }
        renderOptionExtra={ renderOptionExtra }
        optionClassNames={ optionClassNames }
      />
    )

  const select = (
    <div className="relative">
      <div
        { ...triggerStateProps }
        className="group/select relative outline-none"
        ref={ containerRef }
        role="combobox"
        aria-label={ ariaLabel }
        aria-labelledby={ triggerLabelledby }
        aria-expanded={ isOpen }
        aria-haspopup="listbox"
        aria-controls={ isOpen
          ? listboxIds
          : undefined }
        aria-activedescendant={ activeDescendantId }
        aria-autocomplete={ editable
          ? 'list'
          : undefined }
        aria-disabled={ disabled || undefined }
        tabIndex={ disabled || editable
          ? undefined
          : 0 }
        onClick={ () => {
          if (disabled) return
          onClick?.()
        } }
        onKeyDown={ (event) => {
          handleKeyDown(event)
          if (event.defaultPrevented) scrollActiveOption()
        } }
      >
        <div
          { ...triggerStateProps }
          className={ cn(
            'flex min-h-9 items-center justify-between rounded-xl bg-background px-3 py-1.5 text-sm text-text',
            'transition-colors duration-200 ease-in-out',
            disabled
              ? 'cursor-not-allowed bg-background2 opacity-50'
              : editable
              ? 'cursor-text'
              : 'cursor-pointer hover:bg-background2',
            isOpen && 'bg-background2',
            actualError && 'ring-1 ring-inset ring-danger',
            { 'cursor-wait': loading },
            className,
          ) }
          onMouseDown={ (event) => {
            const target = event.target as HTMLElement
            if (!disabled && target.tagName !== 'INPUT' && target.tagName !== 'BUTTON') containerRef.current?.focus()
          } }
          onClick={ editable
            ? undefined
            : () => !disabled && !loading && setIsOpen(!isOpen) }
          onMouseEnter={ () => setIsTriggerHovered(true) }
          onMouseLeave={ () => setIsTriggerHovered(false) }
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            { prefixIcon && <span className="flex shrink-0 items-center">{ prefixIcon }</span> }
            { loading
              ? <Loader2 className="text-text2 h-5 w-5 animate-spin" />
              : editable
              ? (
                <input
                  value={ inputText }
                  onChange={ (e) => handleInputChange(e.target.value) }
                  onFocus={ handleInputFocus }
                  onBlur={ handleInputBlur }
                  onKeyDown={ handleInputKeyDown }
                  disabled={ disabled }
                  placeholder={ placeholder }
                  className={ cn('bg-transparent outline-none w-full min-w-0', editableInputClassName) }
                />
              )
              : customValue != null
              ? customValue
              : selectedLabels.length > 0
              ? (
                <span className="truncate">
                  { multiple
                    ? selectedLabels.join(', ')
                    : selectedLabels[0] }
                </span>
              )
              : (
                <div className={ cn('flex items-center gap-2', { 'mr-2': !!placeholderIcon }) }>
                  <span className={ cn('mr-2 select-none text-text2', placeholderClassName) }>
                    { placeholder }
                    { required && !label && <span className="text-danger ml-1">*</span> }
                  </span>
                  { placeholderIcon && <>{ placeholderIcon }</> }
                </div>
              ) }
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
                    aria-label={ t('clearSelection') }
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
      </div>

      <SafePortal>
        <DropdownPanelFrame
          open={ isOpen }
          above={ panelOnTop }
          height={ dropdownLayout.panelHeight }
          style={ { ...dropdownLayout.positionStyle, zIndex: Math.ceil(layerPriority) } }
          motionOptions={ dropdownMotion }
          className={ cn('rounded-[20px] bg-background', shadowed && 'shadow-card', bordered && 'ring-1 ring-inset ring-border') }
        >
          { dropdown }
        </DropdownPanelFrame>
      </SafePortal>

      { actualError && actualErrorMessage && (
        <div className="text-danger mt-1 text-xs">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )

  if (!label) return select

  /**
   * 触发器是 div 而非原生表单控件，label 无法用 htmlFor 关联，点击时手动聚焦：
   * 普通模式聚焦 combobox 本身，editable 模式 combobox 不可聚焦，改为聚焦内部输入框
   */
  const focusTrigger = () => {
    if (disabled) return
    const target = editable
      ? containerRef.current?.querySelector('input')
      : containerRef.current
    target?.focus()
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        id={ labelId }
        className={ cn(
          'block text-sm text-text',
          { 'text-danger': actualError },
          labelClassName,
        ) }
        onClick={ focusTrigger }
      >
        { label }
        { required && <span className="text-danger ml-1">*</span> }
      </label>
      { select }
    </div>
  )
}

InnerSelect.displayName = 'Select'

export const Select = memo(InnerSelect) as typeof InnerSelect

function filterOptionsByQuery(options: Option[], query: string) {
  if (!query) return options
  const normalized = query.toLowerCase()
  return options.filter((option) => option.label?.toString().toLowerCase().includes(normalized))
}

/**
 * 打开或过滤后的初始高亮：落在已选项上，否则取 `direction` 方向的首个可用项
 *
 * 不落在已选项上时，首项会和已选项同时带底色，看起来像两项被选中
 */
function getInitialHighlightIndex(options: Option[], selectedValues: string[], direction: 1 | -1 = 1) {
  const selectedIndex = options.findIndex((opt) => !opt.disabled && selectedValues.includes(opt.value))
  return selectedIndex >= 0
    ? selectedIndex
    : getEnabledBoundaryIndex(options, direction)
}
