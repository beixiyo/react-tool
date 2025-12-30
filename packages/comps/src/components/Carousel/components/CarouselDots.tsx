import type { CarouselProps } from '../types'
import { memo } from 'react'
import { cn } from 'utils'
import { calculateDirection } from '../utils'

interface CarouselDotsProps {
  imgs: string[]
  currentIndex: number
  indicatorType: CarouselProps['indicatorType']
  onDotClick: (index: number, direction: number) => void
}

export const CarouselDots = memo<CarouselDotsProps>(({
  imgs,
  currentIndex,
  indicatorType = 'dot',
  onDotClick,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex gap-2 -translate-x-1/2">
      {imgs.map((_, index) => (
        <button
          key={ index }
          onClick={ () => {
            const direction = calculateDirection(index, currentIndex)
            onDotClick(index, direction)
          } }
          className={ cn(
            indicatorType === 'dot'
              ? 'h-2 w-2 rounded-full transition-all duration-300 hover:scale-125'
              : 'h-1 w-8 rounded-xs transition-all',
            index === currentIndex
              ? 'bg-white shadow-lg'
              : 'bg-white/50 hover:bg-white/70',
          ) }
          aria-label={ `Go to slide ${index + 1}` }
        />
      ))}
    </div>
  )
})

CarouselDots.displayName = 'CarouselDots'
