import type { CascaderOption } from '../types'
import { useCallback, useEffect, useState } from 'react'
import { findOption } from '../../../utils/optionTree'

export function useCascaderValue(
  options: CascaderOption[],
  actualValue: string | undefined,
  defaultValue: string | undefined,
  handleChangeVal: (value: string, meta: any) => void,
  setOpen: (open: boolean) => void,
  disabled?: boolean,
) {
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (actualValue !== undefined)
      return actualValue
    if (defaultValue !== undefined)
      return defaultValue
    return ''
  })

  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
    }
  }, [actualValue])

  const handleOptionClick = useCallback((optionValue: string) => {
    if (disabled)
      return

    const option = findOption(options, optionValue)
    if (option && !option.children) {
      setInternalValue(optionValue)
      handleChangeVal(optionValue, {} as any)
      setOpen(false)
    }
  }, [disabled, options, handleChangeVal, setOpen])

  return { internalValue, setInternalValue, handleOptionClick }
}
