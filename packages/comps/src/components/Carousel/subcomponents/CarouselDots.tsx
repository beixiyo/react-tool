import { memo } from 'react'
import { cn } from 'utils'
import { useAriaT } from '../../../i18n'
import type { CarouselProps } from '../types'
import { calculateDirection } from '../utils'

interface CarouselDotsProps {
  imgs: string[]
  currentIndex: number
  indicatorType: CarouselProps['indicatorType']
  className?: string
  dotClassName?: string
  activeDotClassName?: string
  onDotClick: (index: number, direction: number) => void
}

export const CarouselDots = memo<CarouselDotsProps>(({
  imgs,
  currentIndex,
  indicatorType = 'dot',
  className,
  dotClassName,
  activeDotClassName,
  onDotClick,
}) => {
  const t = useAriaT()

  return (
    <div className={ cn('absolute bottom-4 left-1/2 z-10 flex gap-2 -translate-x-1/2', className) }>
      { imgs.map((_, index) => (
        <button
          key={ index }
          type="button"
          aria-current={ index === currentIndex }
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
            dotClassName,
            index === currentIndex && activeDotClassName,
          ) }
          aria-label={ t('goToSlide', { index: index + 1 }) }
        />
      )) }
    </div>
  )
})

CarouselDots.displayName = 'CarouselDots'
