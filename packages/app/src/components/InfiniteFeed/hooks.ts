import type { Optional } from '@jl-org/ts-tool'
import type { FeedItem } from './types'
import { useEffect, useRef, useState } from 'react'

/**
 * 管理信息流数据的 Hook
 */
export function useFeedItems(initialItems: FeedItem[], generateItem: (id: number) => FeedItem, autoGenerateInterval: number, maxRetainCount: number, isPaused: boolean) {
  const [items, setItems] = useState<FeedItem[]>(initialItems)
  const counterRef = useRef(initialItems.length)

  useEffect(() => {
    if (autoGenerateInterval === 0)
      return

    const interval = setInterval(() => {
      if (!isPaused) {
        setItems((prev) => {
          const newItem = generateItem(counterRef.current++)
          const updated = [...prev, newItem]
          return updated.slice(-maxRetainCount)
        })
      }
    }, autoGenerateInterval * 1000)

    return () => clearInterval(interval)
  }, [autoGenerateInterval, isPaused, maxRetainCount, generateItem])

  const addItem = (item: Optional<
    Omit<FeedItem, 'id' | 'timestamp'>,
    'color'
  >) => {
    const newItem: FeedItem = {
      id: counterRef.current++,
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      color: item.color || '#60a5fa',
      ...item,
    }
    setItems(prev => [...prev, newItem].slice(-maxRetainCount))
  }

  return {
    items,
    addItem,
  }
}

/**
 * 管理选中项的 Hook
 */
export function useSelectedItem<T>(onPausedChange?: (paused: boolean) => void) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const selectItem = (item: T) => {
    setSelectedItem(item)
    onPausedChange?.(true)
  }

  const clearSelection = () => {
    setSelectedItem(null)
    onPausedChange?.(false)
  }

  return {
    selectedItem,
    selectItem,
    clearSelection,
  }
}
