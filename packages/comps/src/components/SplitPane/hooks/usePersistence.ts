import { useDebounceFn } from 'hooks'
import { useCallback, useEffect, useRef } from 'react'
import type { PanelState, PersistedState } from '../types'
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
  const activeRef = useRef(false)

  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
    }
  }, [])

  const loadState = useCallback((): PersistedState | null => {
    if (!storageKey) return null
    const persisted = loadPersistedState(storageKey)
    if (!persisted) return null
    /** 验证面板数量是否匹配 */
    if (persisted.sizes.length !== panelCount) return null
    return persisted
  }, [storageKey, panelCount])

  const saveState = useDebounceFn(() => {
    // useDebounceFn 不提供取消接口，卸载后禁止待执行回调写入缓存
    if (!activeRef.current || !storageKey) return
    savePersistedState(storageKey, states)
  }, { delay: 100 })

  /** 状态变化时自动保存 */
  useEffect(() => {
    if (states.length > 0) {
      saveState()
    }
  }, [storageKey, states, saveState])

  return { loadState, saveState }
}
