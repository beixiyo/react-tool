import type { CollaborationSession, HistoryManagerResult } from '../types'
import localforage from 'localforage'
import { useCallback } from 'react'
import { HISTORY_STORAGE_KEY } from '../constants'

localforage.config({
  name: 'ai-collaboration',
  storeName: 'history',
})

export function useHistoryManager(): HistoryManagerResult {
  const loadHistory = useCallback(async () => {
    const list = await localforage.getItem<CollaborationSession[]>(HISTORY_STORAGE_KEY)
    if (!list || !Array.isArray(list))
      return []
    return list
  }, [])

  const saveSession = useCallback(async (session: CollaborationSession) => {
    const list = await loadHistory()
    const next = list.filter(item => item.id !== session.id)
    next.unshift({ ...session, updatedAt: Date.now() })
    // @TODO: 未来引入服务端同步时替换为实际 API 调用
    await localforage.setItem(HISTORY_STORAGE_KEY, next)
  }, [loadHistory])

  const removeSession = useCallback(async (sessionId: string) => {
    const list = await loadHistory()
    const next = list.filter(item => item.id !== sessionId)
    // @TODO: 集成后端后改用远程删除接口
    await localforage.setItem(HISTORY_STORAGE_KEY, next)
  }, [loadHistory])

  const clearAll = useCallback(async () => {
    // @TODO: 提供批量清空的后端接口
    await localforage.removeItem(HISTORY_STORAGE_KEY)
  }, [])

  return {
    loadHistory,
    saveSession,
    removeSession,
    clearAll,
  }
}
