import type { PanelState, PersistedState } from '../types'
import { useCallback, useEffect, useRef } from 'react'
import { loadPersistedState, savePersistedState } from '../utils'

export type UsePersistenceOptions = {
  /**
   * localStorage 存储键名
   */
  storageKey?: string
  /**
   * 面板数量
   */
  panelCount: number
  /**
   * 状态变更时触发保存
   */
  states: PanelState[]
}

export type UsePersistenceReturn = {
  /**
   * 加载持久化状态
   */
  loadState: () => PersistedState | null
  /**
   * 保存当前状态
   */
  saveState: () => void
}

/**
 * 状态持久化 Hook
 */
export function usePersistence(options: UsePersistenceOptions): UsePersistenceReturn {
  const { storageKey, panelCount, states } = options
  const debounceTimerRef = useRef<number | null>(null)

  const loadState = useCallback((): PersistedState | null => {
    if (!storageKey)
      return null
    const persisted = loadPersistedState(storageKey)
    if (!persisted)
      return null
    /** 验证面板数量是否匹配 */
    if (persisted.sizes.length !== panelCount)
      return null
    return persisted
  }, [storageKey, panelCount])

  const saveState = useCallback(() => {
    if (!storageKey)
      return

    /** 防抖保存 */
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = window.setTimeout(() => {
      savePersistedState(storageKey, states)
    }, 100)
  }, [storageKey, states])

  /** 状态变化时自动保存 */
  useEffect(() => {
    if (states.length > 0) {
      saveState()
    }
  }, [states, saveState])

  /** 清理定时器 */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { loadState, saveState }
}
