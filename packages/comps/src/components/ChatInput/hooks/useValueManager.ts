import type { ChatInputProps } from '../types'
import { useLatestCallback } from 'hooks'
import { useState } from 'react'

/**
 * 用于管理输入值的 Hook，支持受控和非受控模式
 * @param value - 来自 props 的受控值
 * @param onChange - 来自 props 的值更改回调
 * @returns 一个包含实际值和更新它的处理程序的对象
 */
export function useValueManager(
  value: ChatInputProps['value'],
  onChange: ChatInputProps['onChange'],
) {
  const [internalVal, setInternalVal] = useState<string>('')
  const isControlMode = value !== undefined

  const actualValue = isControlMode
    ? value
    : internalVal

  const handleChangeVal = useLatestCallback((val: string) => {
    isControlMode
      ? onChange?.(val)
      : setInternalVal(val)
  })

  return {
    actualValue,
    handleChangeVal,
  }
}
