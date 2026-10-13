/**
 * 非级联下拉面板：可选搜索框 + 单列选项列表 + 可选 footer
 * 只负责渲染与事件转发，高亮、选中、开关等状态由 Select 持有
 */
import { Inbox, Search } from 'lucide-react'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Input } from '../../Input'
import type { Option, SelectOptionClassNames } from '../types'
import { SelectOption } from './SelectOption'

export function SelectListPanel(props: SelectListPanelProps) {
  const {
    panelRef,
    open,
    className,
    style,
    listboxId,
    getOptionId,
    options,
    selectedValues,
    highlightedIndex,
    multiple,
    preventBlur,
    search,
    showEmpty,
    footer,
    footerScrollable,
    onOptionClick,
    onOptionHover,
    onListMouseLeave,
    onClose,
    renderOptionExtra,
    optionClassNames,
  } = props

  /** 没有 footer 时没有「随滚动」的对象，保持原有结构 */
  const footerInScroll = !!footerScrollable && footer != null

  return (
    <div
      ref={ panelRef }
      { ...{
        [DATA_ATTR.state]: open
          ? 'open'
          : 'closed',
      } }
      className={ cn('flex flex-col', className) }
      aria-hidden={ !open }
      style={ style }
      onMouseDown={ preventBlur
        ? (e) => e.preventDefault() // 防止 input blur 早于 option click
        : undefined }
    >
      { search && (
        <div className="shrink-0 px-2 pb-1">
          <Input
            size="sm"
            variant="underlined"
            prefix={ <Search size={ 16 } /> }
            placeholder="Search..."
            value={ search.query }
            onChange={ search.onChange }
            onClick={ (e) => e.stopPropagation() }
            onKeyDown={ (e) => {
              if (e.key === 'Escape') onClose()
              e.stopPropagation()
            } }
          />
        </div>
      ) }

      <ScrollWrap enabled={ footerInScroll }>
        <div
          id={ listboxId }
          role="listbox"
          aria-multiselectable={ multiple || undefined }
          className={ cn('flex flex-col gap-1', footerInScroll
            ? 'shrink-0'
            : 'min-h-0 flex-1 overflow-auto') }
          onMouseLeave={ onListMouseLeave }
        >
          { options.map((option, idx) => (
            <SelectOption
              key={ option.value }
              id={ getOptionId(idx) }
              option={ option }
              selected={ selectedValues.includes(option.value) }
              highlighted={ idx === highlightedIndex }
              onClick={ onOptionClick }
              onMouseEnter={ () => onOptionHover(idx) }
              renderExtra={ renderOptionExtra }
              { ...optionClassNames }
            />
          )) }

          { options.length === 0 && showEmpty && (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-text2">
              <Inbox size={ 48 } />
              <span className="text-xs">No matching options</span>
            </div>
          ) }
        </div>

        { footer != null && (
          <div
            className="shrink-0"
            onKeyDown={ (e) => {
              /** footer 内的键盘事件不能冒泡成选项导航，Esc 只关闭面板 */
              if (e.key === 'Escape') onClose()
              e.stopPropagation()
            } }
          >
            { footer }
          </div>
        ) }
      </ScrollWrap>
    </div>
  )
}

/** footer 随列表滚动时，列表与 footer 共用一个滚动容器；否则不增加 DOM 层级 */
function ScrollWrap({ enabled, children }: { enabled: boolean, children: ReactNode }) {
  return enabled
    ? <div className="flex min-h-0 flex-1 flex-col overflow-auto">{ children }</div>
    : <>{ children }</>
}

export type SelectListPanelProps = {
  panelRef: Ref<HTMLDivElement>
  open: boolean
  className?: string
  style?: CSSProperties
  listboxId: string
  getOptionId: (index: number) => string
  options: Option[]
  selectedValues: string[]
  highlightedIndex: number
  multiple: boolean
  /** editable 模式下阻止面板 mousedown 抢走输入框焦点 */
  preventBlur: boolean
  /** 传入时渲染搜索框 */
  search?: {
    query: string
    onChange: (query: string) => void
  }
  showEmpty: boolean
  footer?: ReactNode
  /** footer 是否随选项列表一起滚动 */
  footerScrollable?: boolean
  onOptionClick: (value: string) => void
  onOptionHover: (index: number) => void
  onListMouseLeave: () => void
  onClose: () => void
  renderOptionExtra?: (option: Option) => ReactNode
  optionClassNames: SelectOptionClassNames
}
