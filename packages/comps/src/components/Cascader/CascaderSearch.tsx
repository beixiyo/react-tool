'use client'

import { Search } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Input } from '../Input'
import { CascaderOption } from './CascaderOption'
import { useCascaderSearchNavigation } from './hooks'
import type { FlatOption } from './hooks/useCascaderSearch'
import type { CascaderOptionClassNames } from './types'

export interface CascaderSearchProps extends CascaderOptionClassNames {
  searchQuery: string
  setSearchQuery: (query: string) => void
  dropdownHeight: number
  filteredOptions: FlatOption[]
  internalValue?: string
  handleOptionClick: (value: string) => void
  isSingleLevel?: boolean
  onFocusMenuByKeyboard?: () => void
  focusSearchToken?: number
  enableScrollAnimation: boolean
  listboxId?: string
  optionIdPrefix?: string
  disabled?: boolean
  onFocus?: () => void
  /** 支持 Cascader 传入的 option 前缀类名 */
  optionClassName?: string
  optionContentClassName?: string
  optionLabelClassName?: string
  optionCheckIconClassName?: string
  optionChevronIconClassName?: string
}

const SEARCH_MIN_WIDTH = 200

function InnerCascaderSearch(props: CascaderSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    dropdownHeight,
    filteredOptions,
    internalValue,
    handleOptionClick,
    isSingleLevel,
    onFocusMenuByKeyboard,
    focusSearchToken,
    enableScrollAnimation,
    listboxId,
    optionIdPrefix,
    disabled = false,
    onFocus,
    /** 基础类名 */
    className,
    contentClassName,
    labelClassName,
    checkIconClassName,
    chevronIconClassName,
    /** option 前缀类名 */
    optionClassName,
    optionContentClassName,
    optionLabelClassName,
    optionCheckIconClassName,
    optionChevronIconClassName,
  } = props

  const optionStyles: CascaderOptionClassNames = {
    className: optionClassName || className,
    contentClassName: optionContentClassName || contentClassName,
    labelClassName: optionLabelClassName || labelClassName,
    checkIconClassName: optionCheckIconClassName || checkIconClassName,
    chevronIconClassName: optionChevronIconClassName || chevronIconClassName,
  }

  const {
    inputRef,
    scrollContainerRef,
    highlightedIndex,
    activeIndex,
    handleKeyDown,
    handleOptionHover,
  } = useCascaderSearchNavigation({
    searchQuery,
    filteredOptions,
    internalValue,
    focusSearchToken,
    enableScrollAnimation,
    isSingleLevel,
    onFocusMenuByKeyboard,
    handleOptionClick,
  })

  return (
    <div
      className={ cn(
        'flex flex-col',
        !isSingleLevel && 'border-r border-border',
        searchQuery || isSingleLevel
          ? 'w-full'
          : `w-[${SEARCH_MIN_WIDTH}px]`,
      ) }
      style={ { minWidth: SEARCH_MIN_WIDTH } }
    >
      <div className="p-2 border-b border-border">
        <Input
          ref={ inputRef }
          size="sm"
          variant="underlined"
          prefix={ <Search size={ 16 } /> }
          placeholder="Search..."
          value={ searchQuery }
          onChange={ setSearchQuery }
          disabled={ disabled }
          aria-controls={ listboxId }
          aria-activedescendant={ getActiveOptionId(optionIdPrefix, activeIndex) }
          aria-autocomplete="list"
          onClick={ (e) => e.stopPropagation() }
          onFocus={ onFocus }
          onKeyDown={ handleKeyDown }
        />
      </div>
      <div
        ref={ scrollContainerRef }
        id={ listboxId }
        role="listbox"
        aria-label="Search results"
        className="overflow-auto py-1"
        style={ { maxHeight: dropdownHeight } }
      >
        { filteredOptions.length > 0
          ? (
            filteredOptions.map((opt, index) => {
              const isHighlighted = index === highlightedIndex || (highlightedIndex === -1 && internalValue === opt.value)
              const isSelected = internalValue === opt.value

              return (
                <CascaderOption
                  key={ opt.value }
                  option={ {
                    ...opt.raw,
                    label: opt.label, // 搜索模式下显示完整路径
                  } }
                  id={ optionIdPrefix
                    ? `${optionIdPrefix}-${index}`
                    : undefined }
                  selected={ isSelected }
                  highlighted={ isHighlighted }
                  onClick={ handleOptionClick }
                  onMouseEnter={ () => handleOptionHover(index) }
                  { ...optionStyles }
                />
              )
            })
          )
          : searchQuery && (
            <div className="px-3 py-4 text-center text-xs text-text2">
              No results found
            </div>
          ) }
      </div>
    </div>
  )
}

InnerCascaderSearch.displayName = 'CascaderSearch'

export const CascaderSearch = memo(InnerCascaderSearch)

function getActiveOptionId(prefix: string | undefined, index: number): string | undefined {
  return prefix && index >= 0
    ? `${prefix}-${index}`
    : undefined
}
