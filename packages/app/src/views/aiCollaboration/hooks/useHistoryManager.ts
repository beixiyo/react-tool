/**
 * 历史记录管理 Hook
 */

import type { WorkflowSession } from '../types'
import localforage from 'localforage'
import { useCallback } from 'react'

const HISTORY_STORAGE_KEY = 'ai-workflow-history'

localforage.config({
  name: 'ai-workflow',
  storeName: 'history',
})

export type HistoryManagerResult = {
  loadHistory: () => Promise<WorkflowSession[]>
  saveSession: (session: WorkflowSession) => Promise<void>
  removeSession: (sessionId: string) => Promise<void>
  clearAll: () => Promise<void>
}

export function useHistoryManager(): HistoryManagerResult {
  const loadHistory = useCallback(async () => {
    const list = await localforage.getItem<WorkflowSession[]>(HISTORY_STORAGE_KEY)
    if (!list || !Array.isArray(list))
      return []
    return list
  }, [])

  const saveSession = useCallback(async (session: WorkflowSession) => {
    const list = await loadHistory()
    const next = list.filter(item => item.id !== session.id)
    next.unshift({ ...session, updatedAt: Date.now() })
    await localforage.setItem(HISTORY_STORAGE_KEY, next)
  }, [loadHistory])

  const removeSession = useCallback(async (sessionId: string) => {
    const list = await loadHistory()
    const next = list.filter(item => item.id !== sessionId)
    await localforage.setItem(HISTORY_STORAGE_KEY, next)
  }, [loadHistory])

  const clearAll = useCallback(async () => {
    await localforage.removeItem(HISTORY_STORAGE_KEY)
  }, [])

  return {
    loadHistory,
    saveSession,
    removeSession,
    clearAll,
  }
}
