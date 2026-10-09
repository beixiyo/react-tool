/**
 * 级联下拉面板：按菜单栈横向渲染多列列表，每列独立滚动
 * 只负责渲染与事件转发，菜单栈与高亮由 Select 持有
 */
import type { CSSProperties, ReactNode, Ref } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import type { Option, SelectOptionClassNames } from '../types'
import { SelectOption } from './SelectOption'

export function SelectCascadePanel(props: SelectCascadePanelProps) {
  const {
    panelRef,
    open,
    className,
    style,
    listboxMaxHeight,
    getListboxId,
    getOptionId,
    menuStack,
    selectedValues,
    highlightedIndices,
    multiple,
    onOptionClick,
    onOptionHover,
    onMouseLeave,
    renderOptionExtra,
    optionClassNames,
  } = props

  return (
    <div
      ref={ panelRef }
      { ...{
        [DATA_ATTR.state]: open
          ? 'open'
          : 'closed',
      } }
      className={ cn('flex w-max gap-2', className) }
      style={ style }
      aria-hidden={ !open }
      onMouseLeave={ onMouseLeave }
    >
      { menuStack.map((menuOptions, level) => (
        <div
          key={ level }
          id={ getListboxId(level) }
          role="listbox"
          aria-multiselectable={ multiple || undefined }
          className="overflow-auto"
          style={ { maxHeight: listboxMaxHeight } }
        >
          <div className="flex min-w-40 flex-col gap-1">
            { menuOptions.map((option, idx) => (
              <SelectOption
                key={ option.value }
                id={ getOptionId(level, idx) }
                option={ option }
                selected={ selectedValues.includes(option.value) }
                highlighted={ idx === (highlightedIndices[level] ?? -1) }
                onClick={ onOptionClick }
                onMouseEnter={ () => onOptionHover(option, level, idx) }
                renderExtra={ renderOptionExtra }
                { ...optionClassNames }
              />
            )) }
          </div>
        </div>
      )) }
    </div>
  )
}

export type SelectCascadePanelProps = {
  panelRef: Ref<HTMLDivElement>
  open: boolean
  className?: string
  style?: CSSProperties
  /** 每列列表的最大高度（px） */
  listboxMaxHeight: number
  getListboxId: (level: number) => string
  getOptionId: (level: number, index: number) => string
  menuStack: Option[][]
  selectedValues: string[]
  highlightedIndices: number[]
  multiple: boolean
  onOptionClick: (value: string) => void
  onOptionHover: (option: Option, level: number, index: number) => void
  onMouseLeave: () => void
  renderOptionExtra?: (option: Option) => ReactNode
  optionClassNames: SelectOptionClassNames
}
