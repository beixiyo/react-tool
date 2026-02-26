'use client'

import { useEffect, useState } from 'react'

interface UseChartAnimationOptions {
  duration: number
  enabled?: boolean
}

/**
 * 封装图表加载动画时序逻辑
 */
export function useChartAnimation({
  duration,
  enabled = true,
}: UseChartAnimationOptions) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true)
      return
    }

    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, enabled])

  return {
    isLoaded,
  }
}
