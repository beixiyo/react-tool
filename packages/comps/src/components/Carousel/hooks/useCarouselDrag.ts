import { useCallback } from 'react'
import { SWIPE_CONFIDENCE_THRESHOLD } from '../constants'
import { swipePower } from '../utils'

/**
 * 轮播图拖拽逻辑 Hook
 */
export function useCarouselDrag(
  enableSwipe: boolean,
  paginate: (direction: number) => void,
) {
  const handleDragEnd = useCallback(
    (_e: unknown, { offset, velocity }: { offset: { x: number }, velocity: { x: number } }) => {
      if (!enableSwipe) {
        return
      }

      const swipe = swipePower(offset.x, velocity.x)
      if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
        paginate(1)
      }
      else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
        paginate(-1)
      }
    },
    [enableSwipe, paginate],
  )

  return {
    handleDragEnd,
  }
}
