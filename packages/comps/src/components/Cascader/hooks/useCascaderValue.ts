import { useCallback } from 'react'
import { findOption } from '../../../utils/optionTree'
import type { CascaderOption } from '../types'

/**
 * 选中值与点选提交
 *
 * 不另存本地副本：非受控 / 表单态由 useFormField 持有并在 handleChangeVal 里更新，
 * 受控态由父级决定；父级收到 onChange 后不改 value（如二次确认被取消）时，显示值必须留在原值
 */
export function useCascaderValue(
  options: CascaderOption[],
  actualValue: string | undefined,
  handleChangeVal: (value: string, meta: any) => void,
  setOpen: (open: boolean) => void,
  disabled?: boolean,
) {
  const internalValue = actualValue ?? ''

  const handleOptionClick = useCallback((optionValue: string) => {
    if (disabled) return

    const option = findOption(options, optionValue)
    if (option && !option.children) {
      handleChangeVal(optionValue, {} as any)
      setOpen(false)
    }
  }, [disabled, options, handleChangeVal, setOpen])

  return { internalValue, handleOptionClick }
}
