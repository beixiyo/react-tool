import { memo } from 'react'
import type { CascaderOption } from '../../Cascader'
import { Cascader } from '../../Cascader'
import { DATA_DATE_PICKER_IGNORE } from '../constants'

/** CalendarHeader 中年月共用的下拉选择器 */
export const CalendarHeaderSelect = memo<CalendarHeaderSelectProps>(({
  options,
  value,
  onChange,
  minWidth,
  suffix,
}) => (
  <div className="flex items-center">
    <Cascader
      options={ options }
      value={ value }
      onChange={ onChange }
      dropdownMinWidth={ minWidth }
      dropdownHeight={ 250 }
      dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
      menuClassName="overflow-x-hidden"
      trigger={
        <div
          className="cursor-pointer rounded-xl px-2 text-sm font-medium text-text transition-colors hover:bg-background2"
          { ...{ [DATA_DATE_PICKER_IGNORE]: 'true' } }
        >
          { options.find((option) => option.value === value)?.label ?? value }
        </div>
       }
    />
    { suffix && <span className="px-1 text-sm font-medium text-text">{ suffix }</span> }
  </div>
))

CalendarHeaderSelect.displayName = 'CalendarHeaderSelect'

type CalendarHeaderSelectProps = {
  options: CascaderOption[]
  value: string
  onChange: (value: string) => void
  minWidth: number
  suffix?: string
}
