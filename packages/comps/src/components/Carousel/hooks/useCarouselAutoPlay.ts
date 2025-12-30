import { useEffect, useState } from 'react'

/**
 * 轮播图自动播放 Hook
 */
export function useCarouselAutoPlay(
  autoPlayInterval: number,
  imgsLength: number,
  paginate: (direction: number) => void,
) {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused || imgsLength <= 1) {
      return
    }

    const timer = setInterval(() => {
      paginate(1)
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [autoPlayInterval, isPaused, paginate, imgsLength])

  return {
    isPaused,
    setIsPaused,
  }
}
