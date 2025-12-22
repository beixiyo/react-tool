import { createContext, useContext } from 'react'

/**
 * ButtonGroup Context 类型
 */
export interface ButtonGroupContextValue {
  /**
   * 当前选中的值
   */
  active?: string

  /**
   * 值变化时的回调
   */
  onChange?: (value: string) => void
}

/**
 * ButtonGroup Context
 */
export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null)

/**
 * 使用 ButtonGroup Context 的 Hook
 */
export function useButtonGroup() {
  return useContext(ButtonGroupContext)
}

