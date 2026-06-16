import type { InputHistory, UseInputHistoryOptions } from '../types'
import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useState } from 'react'

const EMPTY_HISTORY: InputHistory[] = []

export function useInputHistory(options: UseInputHistoryOptions = {}) {
  const {
    enabled = false,
    maxCount = 50,
    items,
    adapter,
  } = options

  const adapterRef = useLatestRef(adapter)
  const [histories, setHistories] = useState<InputHistory[]>(items ?? EMPTY_HISTORY)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(enabled && !!adapter)

  useEffect(() => {
    if (items) {
      setHistories(sortHistories(items).slice(0, maxCount))
    }
  }, [items, maxCount])

  useEffect(() => {
    let canceled = false

    async function loadHistories() {
      if (!enabled || items || !adapterRef.current) {
        if (!enabled)
          setHistories([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const nextHistories = await adapterRef.current.search('')
        if (!canceled)
          setHistories(sortHistories(nextHistories).slice(0, maxCount))
      }
      finally {
        if (!canceled)
          setLoading(false)
      }
    }

    loadHistories()

    return () => {
      canceled = true
    }
  }, [adapterRef, enabled, items, maxCount])

  const addHistory = useLatestCallback((content: string, templateId?: string) => {
    if (!enabled || !content.trim())
      return

    const cleanContent = content.trim()
    const saved = adapterRef.current?.save?.(cleanContent)

    if (isPromise(saved)) {
      saved.then((history) => {
        if (history)
          setHistories(prev => upsertHistory(prev, history, maxCount))
      })
      return
    }

    const newHistory: InputHistory = saved || {
      id: `history-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      content: cleanContent,
      timestamp: Date.now(),
      templateId,
    }

    if (!items)
      setHistories(prev => upsertHistory(prev, newHistory, maxCount))

    setCurrentIndex(-1)
  })

  const deleteHistory = useLatestCallback((id: string) => {
    adapterRef.current?.remove?.(id)

    if (!items)
      setHistories(prev => prev.filter(history => history.id !== id))

    setCurrentIndex(-1)
  })

  const clearAllHistory = useLatestCallback(() => {
    adapterRef.current?.clear?.()

    if (!items)
      setHistories([])

    setCurrentIndex(-1)
  })

  const searchHistory = useLatestCallback((query: string) => {
    if (!query.trim())
      return histories

    const searchQuery = query.toLowerCase()
    return histories.filter(history =>
      history.content.toLowerCase().includes(searchQuery),
    )
  })

  const getPreviousHistory = useLatestCallback(() => {
    if (histories.length === 0)
      return null

    const nextIndex = Math.min(currentIndex + 1, histories.length - 1)
    setCurrentIndex(nextIndex)
    return histories[nextIndex]
  })

  const getNextHistory = useLatestCallback(() => {
    if (histories.length === 0)
      return null

    const nextIndex = Math.max(currentIndex - 1, -1)
    setCurrentIndex(nextIndex)

    if (nextIndex === -1)
      return null
    return histories[nextIndex]
  })

  const resetHistoryNavigation = useLatestCallback(() => {
    setCurrentIndex(-1)
  })

  const getRecentHistory = useLatestCallback((limit = 10) => {
    return histories.slice(0, limit)
  })

  const getHistoryByTemplate = useLatestCallback((templateId: string) => {
    return histories.filter(history => history.templateId === templateId)
  })

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

function sortHistories(histories: InputHistory[]): InputHistory[] {
  return [...histories].sort((a, b) => b.timestamp - a.timestamp)
}

function upsertHistory(histories: InputHistory[], history: InputHistory, maxCount: number): InputHistory[] {
  const existingIndex = histories.findIndex(item => item.content === history.content || item.id === history.id)
  const nextHistory = {
    ...history,
    timestamp: history.timestamp || Date.now(),
  }

  const updated = existingIndex >= 0
    ? [nextHistory, ...histories.slice(0, existingIndex), ...histories.slice(existingIndex + 1)]
    : [nextHistory, ...histories]

  return updated.slice(0, maxCount)
}

function isPromise<T>(value: T | Promise<T> | undefined | void): value is Promise<T> {
  return !!value && typeof value === 'object' && 'then' in value
}
