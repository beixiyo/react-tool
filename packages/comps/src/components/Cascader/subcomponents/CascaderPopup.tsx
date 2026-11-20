'use client'

import { useResizeObserver } from 'hooks'
import { useIsPresent } from 'motion/react'
import { memo, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { cn } from 'utils'
import { Z } from '../../../constants/z-index'
import { EmptyIcon } from '../../../icons/EmptyIcon'
import { DropdownPanelFrame } from '../../Animate/subcomponents/DropdownPanelFrame'
import type { DropdownMotion } from '../../Animate/types'
import type { SizeTransitionTag } from '../../SizeTransition'
import type { FlatOption } from '../hooks/useCascaderSearch'
import type { CascaderOption, CascaderOptionClassNamesFromParent } from '../types'
import { CascaderMenu } from './CascaderMenu'
import { CascaderSearch } from './CascaderSearch'

/** 渲染 Cascader 浮层中的 editable、search 或层级菜单内容 */
function InnerCascaderPopup<Tag extends SizeTransitionTag>(props: CascaderPopupProps<Tag>) {
  const {
    dropdownRef,
    shouldAnimate,
    positionStyle,
    above,
    dropdownStyle,
    dropdownMotion,
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

  const isPresent = useIsPresent()
  const [height, setHeight] = useState(0)

  // 测量完整菜单，不观察正在改变高度的外壳
  useLayoutEffect(() => {
    if (dropdownRef.current) setHeight(dropdownRef.current.offsetHeight)
  }, [dropdownRef])
  useResizeObserver([dropdownRef], () => {
    if (isPresent && dropdownRef.current) setHeight(dropdownRef.current.offsetHeight)
  })

  return (
    <DropdownPanelFrame
      open={ shouldAnimate }
      above={ above }
      height={ height }
      style={ { zIndex: Z.dropdown, ...positionStyle, ...dropdownStyle } }
      motionOptions={ dropdownMotion }
      className={ cn('rounded-[20px] bg-background', shadowed && 'shadow-card', bordered && 'ring-1 ring-inset ring-border') }
    >
      <div
        ref={ dropdownRef }
        className={ cn(
          'overflow-hidden rounded-[20px] px-1 py-2 flex shrink-0 text-text',
          isPresent && 'pointer-events-auto',
          bordered && 'border border-transparent',
          dropdownClassName,
        ) }
        onMouseEnter={ handleDropdownMouseEnter }
        onMouseLeave={ handleDropdownMouseLeave }
        onMouseDown={ editable
          ? (event: React.MouseEvent) => event.preventDefault()
          : undefined }
        { ...dropdownProps }
        inert={ !isPresent || dropdownProps?.inert }
        aria-hidden={ !isPresent || dropdownProps?.['aria-hidden'] }
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
                className="text-text2 flex flex-col items-center justify-center gap-2 py-6"
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
    </DropdownPanelFrame>
  )
}

InnerCascaderPopup.displayName = 'CascaderPopup'

export const CascaderPopup = memo(InnerCascaderPopup) as typeof InnerCascaderPopup

type CascaderPopupProps<Tag extends SizeTransitionTag> = CascaderOptionClassNamesFromParent & {
  dropdownRef: RefObject<HTMLDivElement | null>
  shouldAnimate: boolean
  positionStyle: React.CSSProperties
  above: boolean
  dropdownStyle?: React.CSSProperties
  dropdownMotion?: DropdownMotion<Tag>
  dropdownProps?: React.ComponentPropsWithoutRef<'div'>
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
