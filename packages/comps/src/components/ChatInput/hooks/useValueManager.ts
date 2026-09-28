import { useLatestCallback } from 'hooks'
import { useState } from 'react'

/**
 * 管理一个受控 / 非受控双模式的值
 *
 * `value !== undefined` 视为受控：改值只回调 `onChange`，组件不持有；
 * 否则内部 `useState(defaultValue)` 持有。文本与图片列表共用同一套语义
 * @param value - 来自 props 的受控值
 * @param onChange - 来自 props 的值更改回调
 * @param defaultValue - 非受控模式下的初始值
 */
export function useValueManager<T>(
  value: T | undefined,
  onChange: ((value: T) => void) | undefined,
  defaultValue: T,
) {
  const [internalVal, setInternalVal] = useState<T>(defaultValue)
  const isControlMode = value !== undefined

  const actualValue = isControlMode
    ? value
    : internalVal

  const handleChangeVal = useLatestCallback((val: T) => {
    if (isControlMode) {
      onChange?.(val)
    }
    else {
      setInternalVal(val)
    }
  })

  return {
    actualValue,
    handleChangeVal,
    isControlMode,
  }
}
