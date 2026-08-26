'use client'

import type { RefObject } from 'react'
import { memo } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { EmptyIcon } from '../../icons/EmptyIcon'
import { AnimateShow } from '../Animate'
import { CascaderMenu } from './CascaderMenu'
import { CascaderSearch } from './CascaderSearch'
import type { FlatOption } from './hooks/useCascaderSearch'
import type { CascaderOption, CascaderOptionClassNamesFromParent } from './types'

/** 渲染 Cascader 浮层中的 editable、search 或层级菜单内容 */
function InnerCascaderPopup(props: CascaderPopupProps) {
  const {
    dropdownRef,
    shouldAnimate,
    positionStyle,
    dropdownStyle,
    dropdownProps,
    dropdownClassName,
    shadowed,
    bordered,
    dropdownHeight,
    dropdownMinWidth,
    menuClassName,
    internalValue,
    optionClickIgnoreSelector,
    editable,
    editableFilteredOptions,
    editableHighlightedIndex,
    handleEditableOptionClick,
    handleEditableOptionHover,
    searchable,
    searchQuery,
    setSearchQuery,
    filteredOptions,
    isSingleLevel,
    handleOptionClick,
    onFocusMenuByKeyboard,
    focusSearchToken,
    enableScrollAnimation,
    searchListboxId,
    searchOptionIdPrefix,
    disabled,
    onSearchFocus,
    menuStack,
    highlightedIndices,
    handleOptionHover,
    getMenuId,
    getMenuOptionIdPrefix,
    handleDropdownMouseEnter,
    handleDropdownMouseLeave,
    optionClassName,
    optionContentClassName,
    optionLabelClassName,
    optionCheckIconClassName,
    optionChevronIconClassName,
  } = props

  return (
    <AnimateShow
      show={ shouldAnimate }
      ref={ dropdownRef }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ { zIndex: Z.dropdown, ...positionStyle, ...dropdownStyle } }
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
          ? (event: React.MouseEvent) => event.preventDefault()
          : undefined }
        { ...dropdownProps }
      >
        { editable
          ? editableFilteredOptions.length > 0
            ? (
              <CascaderMenu
                menuOptions={ editableFilteredOptions }
                level={ 0 }
                listboxId={ getMenuId(0) }
                optionIdPrefix={ getMenuOptionIdPrefix(0) }
                dropdownHeight={ dropdownHeight }
                dropdownMinWidth={ dropdownMinWidth }
                internalValue={ internalValue }
                highlightedIndices={ [editableHighlightedIndex] }
                handleOptionClick={ handleEditableOptionClick }
                handleOptionHover={ handleEditableOptionHover }
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
                  onFocusMenuByKeyboard={ onFocusMenuByKeyboard }
                  focusSearchToken={ focusSearchToken }
                  enableScrollAnimation={ enableScrollAnimation }
                  listboxId={ searchListboxId }
                  optionIdPrefix={ searchOptionIdPrefix }
                  disabled={ disabled }
                  onFocus={ onSearchFocus }
                />
              ) }

              { ((!searchQuery && !isSingleLevel) || !searchable) && menuStack.map((menuOptions, level) => (
                <CascaderMenu
                  key={ level }
                  menuOptions={ menuOptions }
                  level={ level }
                  listboxId={ getMenuId(level) }
                  optionIdPrefix={ getMenuOptionIdPrefix(level) }
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
}

InnerCascaderPopup.displayName = 'CascaderPopup'

export const CascaderPopup = memo(InnerCascaderPopup)

type CascaderPopupProps = CascaderOptionClassNamesFromParent & {
  dropdownRef: RefObject<HTMLDivElement | null>
  shouldAnimate: boolean
  positionStyle: React.CSSProperties
  dropdownStyle?: React.CSSProperties
  dropdownProps?: React.HTMLAttributes<HTMLDivElement>
  dropdownClassName?: string
  shadowed: boolean
  bordered: boolean
  dropdownHeight: number
  dropdownMinWidth: number
  menuClassName?: string
  internalValue?: string
  optionClickIgnoreSelector?: string
  editable: boolean
  editableFilteredOptions: CascaderOption[]
  editableHighlightedIndex: number
  handleEditableOptionClick: (value: string) => void
  handleEditableOptionHover: (option: CascaderOption, level: number, index: number) => void
  searchable: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredOptions: FlatOption[]
  isSingleLevel: boolean
  handleOptionClick: (value: string) => void
  onFocusMenuByKeyboard: () => void
  focusSearchToken: number
  enableScrollAnimation: boolean
  searchListboxId: string
  searchOptionIdPrefix: string
  disabled: boolean
  onSearchFocus: () => void
  menuStack: CascaderOption[][]
  highlightedIndices: number[]
  handleOptionHover: (option: CascaderOption, level: number, index: number) => void
  getMenuId: (level: number) => string
  getMenuOptionIdPrefix: (level: number) => string
  handleDropdownMouseEnter: () => void
  handleDropdownMouseLeave: () => void
}
