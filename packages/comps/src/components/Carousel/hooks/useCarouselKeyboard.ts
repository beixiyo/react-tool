import { useEffect } from 'react'

/**
 * 轮播图键盘导航 Hook
 */
export function useCarouselKeyboard(
  enableKeyboardNav: boolean,
  paginate: (direction: number) => void,
) {
  useEffect(() => {
    if (!enableKeyboardNav) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1)
      }
      else if (e.key === 'ArrowRight') {
        paginate(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableKeyboardNav, paginate])
}
