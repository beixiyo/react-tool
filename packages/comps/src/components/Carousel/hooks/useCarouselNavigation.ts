import type { CarouselProps } from '../types'
import { useCallback, useEffect, useState } from 'react'
import { calculateDirection, calculateNextIndex } from '../utils'

/**
 * 轮播图导航逻辑 Hook
 */
export function useCarouselNavigation(
  imgs: string[],
  initialIndex: number,
  transitionType: CarouselProps['transitionType'],
  onSlideChange?: CarouselProps['onSlideChange'],
) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  /** 同步 initialIndex 变化 */
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < imgs.length) {
      setCurrentIndex(initialIndex)
    }
  }, [initialIndex, imgs.length])

  // imgs 动态变短时，currentIndex 越界则回正，避免主图空白与 dots/preview 错位
  useEffect(() => {
    if (imgs.length > 0 && currentIndex >= imgs.length) {
      const safeIndex = Math.max(0, imgs.length - 1)
      setCurrentIndex(safeIndex)
      onSlideChange?.(safeIndex)
    }
  }, [imgs.length, currentIndex, onSlideChange])

  /**
   * 设置当前索引并触发回调函数
   */
  const handleIndexChange = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      onSlideChange?.(index)
    },
    [onSlideChange],
  )

  /**
   * 设置方向（仅在 slide 模式下需要）
   */
  const setDirectionIfNeeded = useCallback(
    (newDirection: number) => {
      if (transitionType === 'slide') {
        setDirection(newDirection)
      }
    },
    [transitionType],
  )

  /**
   * 翻页逻辑
   * 根据方向计算下一个索引，支持循环播放
   */
  const paginate = useCallback(
    (newDirection: number) => {
      setDirectionIfNeeded(newDirection)
      const newIndex = calculateNextIndex(currentIndex, imgs.length, newDirection)
      handleIndexChange(newIndex)
    },
    [currentIndex, imgs.length, handleIndexChange, setDirectionIfNeeded],
  )

  /**
   * 直接跳转到指定索引
   */
  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= imgs.length || index === currentIndex) {
        return
      }

      const newDirection = calculateDirection(index, currentIndex)
      setDirectionIfNeeded(newDirection)
      handleIndexChange(index)
    },
    [currentIndex, handleIndexChange, imgs.length, setDirectionIfNeeded],
  )

  return {
    currentIndex,
    direction,
    paginate,
    goToIndex,
    handleIndexChange,
    setDirectionIfNeeded,
  }
}
