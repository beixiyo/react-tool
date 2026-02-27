'use client'

import type { CascaderOption as CascaderOptionType } from './types'
import { memo } from 'react'
import { CascaderOption } from './CascaderOption'

export interface CascaderMenuProps {
  menuOptions: CascaderOptionType[]
  level: number
  dropdownHeight: number
  dropdownMinWidth: number
  internalValue?: string
  highlightedIndices: number[]
  handleOptionClick: (value: string) => void
  handleOptionHover: (option: CascaderOptionType, level: number, idx: number) => void
  optionClickIgnoreSelector?: string
  optionClassName?: string
  optionContentClassName?: string
  labelClassName?: string
  checkIconClassName?: string
  chevronIconClassName?: string
}

function InnerCascaderMenu(props: CascaderMenuProps) {
  const {
    menuOptions,
    level,
    dropdownHeight,
    dropdownMinWidth,
    internalValue,
    highlightedIndices,
    handleOptionClick,
    handleOptionHover,
    optionClickIgnoreSelector,
    optionClassName,
    optionContentClassName,
    labelClassName,
    checkIconClassName,
    chevronIconClassName,
  } = props

  return (
    <div
      className="overflow-auto border-r last:border-r-0 border-border"
      style={ { maxHeight: dropdownHeight } }
    >
      <div className="py-1" style={ { minWidth: `${dropdownMinWidth}px` } }>
        { menuOptions.map((option, idx) => (
          <CascaderOption
            key={ option.value }
            option={ option }
            selected={ internalValue === option.value }
            highlighted={ idx === (highlightedIndices[level] ?? -1) }
            onClick={ handleOptionClick }
            onMouseEnter={ () => handleOptionHover(option, level, idx) }
            className={ optionClassName }
            contentClassName={ optionContentClassName }
            labelClassName={ labelClassName }
            checkIconClassName={ checkIconClassName }
            chevronIconClassName={ chevronIconClassName }
            optionClickIgnoreSelector={ optionClickIgnoreSelector }
          />
        )) }
      </div>
    </div>
  )
}

InnerCascaderMenu.displayName = 'CascaderMenu'

export const CascaderMenu = memo(InnerCascaderMenu)
