import type { RefObject } from 'react'
import { useCallback, useEffect } from 'react'
import { DATA_DATE_PICKER_IGNORE } from '../constants'

export interface UseClickOutsideOptions {
  /** 是否启用 */
  enabled: boolean
  /** 触发器元素引用 */
  triggerRef: RefObject<HTMLElement | null>
  /** 下拉面板引用 */
  dropdownRef: RefObject<HTMLElement | null>
  /** 点击外部回调 */
  onClickOutside?: () => void
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 统一的点击外部关闭逻辑 Hook
 */
export function useClickOutside({
  enabled,
  triggerRef,
  dropdownRef,
  onClickOutside,
  onClose,
}: UseClickOutsideOptions) {
  /** 处理点击外部关闭 */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement

    // 检查点击目标或其祖先是否带有忽略属性
    if (target.closest(`[${DATA_DATE_PICKER_IGNORE}]`)) {
      return
    }

    if (
      triggerRef.current && !triggerRef.current.contains(event.target as Node)
      && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
    ) {
      onClose?.()
      onClickOutside?.()
    }
  }, [triggerRef, dropdownRef, onClose, onClickOutside])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [enabled, handleClickOutside])
}
