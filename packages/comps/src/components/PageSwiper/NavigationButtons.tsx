import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo } from 'react'

export interface NavigationButtonsProps {
  currentIndex: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

/**
 * 导航按钮组件
 * 显示左右两侧的切换按钮
 */
export const NavigationButtons = memo<NavigationButtonsProps>((props) => {
  const { currentIndex, totalPages, onPrev, onNext } = props

  if (totalPages <= 1)
    return null

  return (
    <>
      {/* 左侧按钮 */}
      { currentIndex > 0 && (
        <button
          onClick={ onPrev }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-background2/20 hover:bg-background2/40 rounded-full backdrop-blur-sm flex items-center justify-center text-text transition-all duration-200"
          aria-label="上一页"
        >
          <ChevronLeft />
        </button>
      ) }

      {/* 右侧按钮 */}
      { currentIndex < totalPages - 1 && (
        <button
          onClick={ onNext }
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-background2/20 hover:bg-background2/40 rounded-full backdrop-blur-sm flex items-center justify-center text-text transition-all duration-200"
          aria-label="下一页"
        >
          <ChevronRight />
        </button>
      ) }
    </>
  )
})

NavigationButtons.displayName = 'NavigationButtons'
