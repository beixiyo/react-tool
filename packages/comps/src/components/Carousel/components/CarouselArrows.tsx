import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo } from 'react'

interface CarouselArrowsProps {
  onPrev: () => void
  onNext: () => void
}

export const CarouselArrows = memo<CarouselArrowsProps>(({ onPrev, onNext }) => {
  return (
    <>
      <button
        onClick={ onPrev }
        className="absolute left-4 top-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-all -translate-y-1/2 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={ onNext }
        className="absolute right-4 top-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-all -translate-y-1/2 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </>
  )
})

CarouselArrows.displayName = 'CarouselArrows'
