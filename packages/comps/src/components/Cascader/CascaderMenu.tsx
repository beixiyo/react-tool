'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { CascaderOption } from './CascaderOption'
import { DATA_CASCADER_MENU } from './constants'
import type { CascaderOption as CascaderOptionType } from './types'

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
  className?: string
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
    className,
  } = props

  return (
    <div
      { ...{ [DATA_CASCADER_MENU]: true } }
      className={ cn(
        'overflow-x-hidden overflow-y-auto border-r last:border-r-0 border-border',
        className,
      ) }
      style={ { maxHeight: dropdownHeight } }
    >
      <div role="listbox" className="py-1" style={ { minWidth: `${dropdownMinWidth}px` } }>
        { menuOptions.map((option, idx) => (
          <div key={ option.value }>
            { option.separatorBefore }
            <CascaderOption
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
          </div>
        )) }
      </div>
    </div>
  )
}

InnerCascaderMenu.displayName = 'CascaderMenu'

export const CascaderMenu = memo(InnerCascaderMenu)
