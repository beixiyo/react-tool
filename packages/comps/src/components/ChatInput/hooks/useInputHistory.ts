import type { InputHistory } from '../types'
import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_CONFIG, STORAGE_KEYS } from '../constants'

/**
 * 输入历史记录管理 Hook
 */
export function useInputHistory(maxCount: number = DEFAULT_CONFIG.MAX_HISTORY_COUNT) {
  const [histories, setHistories] = useState<InputHistory[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(true)

  /** 初始化历史记录 */
  useEffect(() => {
    const loadHistories = async () => {
      try {
        const savedHistories = localStorage.getItem(STORAGE_KEYS.INPUT_HISTORY)
        const parsedHistories: InputHistory[] = savedHistories
          ? JSON.parse(savedHistories)
          : []

        /** 按时间戳降序排列 */
        const sortedHistories = parsedHistories.sort((a, b) => b.timestamp - a.timestamp)
        setHistories(sortedHistories)
      }
      catch (error) {
        console.error('Failed to load input history:', error)
        setHistories([])
      }
      finally {
        setLoading(false)
      }
    }

    loadHistories()
  }, [])

  /** 保存历史记录到本地存储 */
  const saveToStorage = useCallback((histories: InputHistory[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INPUT_HISTORY, JSON.stringify(histories))
    }
    catch (error) {
      console.error('Failed to save input history:', error)
    }
  }, [])

  /** 添加历史记录 */
  const addHistory = useCallback((content: string, templateId?: string) => {
    if (!content.trim())
      return

    const newHistory: InputHistory = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      timestamp: Date.now(),
      templateId,
    }

    setHistories((prev) => {
      /** 检查是否已存在相同内容的记录 */
      const existingIndex = prev.findIndex(h => h.content === newHistory.content)
      let updated: InputHistory[]

      if (existingIndex >= 0) {
        /** 如果存在，更新时间戳并移到最前面 */
        updated = [
          { ...prev[existingIndex], timestamp: newHistory.timestamp },
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
        ]
      }
      else {
        /** 如果不存在，添加到最前面 */
        updated = [newHistory, ...prev]
      }

      /** 限制历史记录数量 */
      if (updated.length > maxCount) {
        updated = updated.slice(0, maxCount)
      }

      saveToStorage(updated)
      return updated
    })

    /** 重置当前索引 */
    setCurrentIndex(-1)
  }, [maxCount, saveToStorage])

  /** 删除历史记录 */
  const deleteHistory = useCallback((id: string) => {
    setHistories((prev) => {
      const updated = prev.filter(history => history.id !== id)
      saveToStorage(updated)
      return updated
    })

    /** 重置当前索引 */
    setCurrentIndex(-1)
  }, [saveToStorage])

  /** 清空所有历史记录 */
  const clearAllHistory = useCallback(() => {
    setHistories([])
    setCurrentIndex(-1)
    saveToStorage([])
  }, [saveToStorage])

  /** 搜索历史记录 */
  const searchHistory = useCallback((query: string) => {
    if (!query.trim())
      return histories

    const searchQuery = query.toLowerCase()
    return histories.filter(history =>
      history.content.toLowerCase().includes(searchQuery),
    )
  }, [histories])

  /** 获取上一个历史记录 */
  const getPreviousHistory = useCallback(() => {
    if (histories.length === 0)
      return null

    const nextIndex = Math.min(currentIndex + 1, histories.length - 1)
    setCurrentIndex(nextIndex)
    return histories[nextIndex]
  }, [histories, currentIndex])

  /** 获取下一个历史记录 */
  const getNextHistory = useCallback(() => {
    if (histories.length === 0)
      return null

    const nextIndex = Math.max(currentIndex - 1, -1)
    setCurrentIndex(nextIndex)

    if (nextIndex === -1)
      return null
    return histories[nextIndex]
  }, [histories, currentIndex])

  /** 重置历史记录导航索引 */
  const resetHistoryNavigation = useCallback(() => {
    setCurrentIndex(-1)
  }, [])

  /** 获取最近的历史记录 */
  const getRecentHistory = useCallback((limit = 10) => {
    return histories.slice(0, limit)
  }, [histories])

  /** 获取使用特定模板的历史记录 */
  const getHistoryByTemplate = useCallback((templateId: string) => {
    return histories.filter(history => history.templateId === templateId)
  }, [histories])

  return {
    histories,
    currentIndex,
    loading,
    addHistory,
    deleteHistory,
    clearAllHistory,
    searchHistory,
    getPreviousHistory,
    getNextHistory,
    resetHistoryNavigation,
    getRecentHistory,
    getHistoryByTemplate,
  }
}
