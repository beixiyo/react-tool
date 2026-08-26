import { memo } from 'react'
import { DATA_DATE_PICKER_IGNORE } from '../../../constants/dataAttributes'
import type { CascaderOption } from '../../Cascader'
import { Cascader } from '../../Cascader'

/** CalendarHeader 中年月共用的下拉选择器 */
export const CalendarHeaderSelect = memo<CalendarHeaderSelectProps>(({
  options,
  value,
  onChange,
  minWidth,
  suffix,
  dropdownZIndex,
  enableScrollAnimation,
}) => {
  const trigger = (
    <div
      className="cursor-pointer rounded-xl px-2 text-sm font-medium text-text transition-colors hover:bg-background2"
      { ...{ [DATA_DATE_PICKER_IGNORE]: 'true' } }
    >
      { options.find((option) => option.value === value)?.label ?? value }
    </div>
  )

  return (
    <div className="flex items-center">
      <Cascader
        options={ options }
        value={ value }
        onChange={ onChange }
        dropdownMinWidth={ minWidth }
        dropdownHeight={ 250 }
        dropdownStyle={ dropdownZIndex === undefined
          ? undefined
          : { zIndex: dropdownZIndex + 1 } }
        dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
        menuClassName="overflow-x-hidden"
        enableScrollAnimation={ enableScrollAnimation }
        trigger={ trigger }
      />
      { suffix && <span className="px-1 text-sm font-medium text-text">{ suffix }</span> }
    </div>
  )
})

CalendarHeaderSelect.displayName = 'CalendarHeaderSelect'

type CalendarHeaderSelectProps = {
  options: CascaderOption[]
  value: string
  onChange: (value: string) => void
  minWidth: number
  suffix?: string
  dropdownZIndex?: number
  enableScrollAnimation?: boolean
}
