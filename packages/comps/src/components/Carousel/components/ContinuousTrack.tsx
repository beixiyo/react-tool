/** 连续轨道：两端复制首尾图，过界后无动画归位，滑动期间始终有相邻图 */

import { memo, useLayoutEffect, useRef, useState } from 'react'
import { useContinuousDrag } from '../hooks/useContinuousDrag'
import { CarouselImage } from './CarouselImage'

export const ContinuousTrack = memo<ContinuousTrackProps>(({
  imgs,
  currentIndex,
  direction,
  duration,
  objectFit,
  placeholderImage,
  children,
  enableSwipe,
  onNext,
  onPrev,
  onTransitionDone,
}) => {
  const count = imgs.length
  const [position, setPosition] = useState(currentIndex + 1)
  const [animate, setAnimate] = useState(false)
  const previousIndex = useRef(currentIndex)
  const drag = useContinuousDrag({ enabled: enableSwipe && count > 1, animating: animate, onNext, onPrev })

  useLayoutEffect(() => {
    if (count <= 1) return
    const previous = previousIndex.current
    if (previous === currentIndex) return
    previousIndex.current = currentIndex
    setAnimate(true)
    setPosition(
      previous === count - 1 && currentIndex === 0 && direction > 0
        ? count + 1
        : previous === 0 && currentIndex === count - 1 && direction < 0
        ? 0
        : currentIndex + 1,
    )
  }, [count, currentIndex, direction])

  const finishTransition = () => {
    // 非首尾翻页也必须解除动画锁，否则第一次翻页后指针拖动永远不可用
    setAnimate(false)
    if (position === 0 || position === count + 1) setPosition(currentIndex + 1)
    drag.onSettled()
    onTransitionDone()
  }

  const slides = count > 1
    ? [imgs[count - 1], ...imgs, imgs[0]]
    : imgs

  return (
    <div
      className={ `absolute inset-0 overflow-hidden touch-pan-y select-none ${
        drag.dragging
          ? 'cursor-grabbing'
          : enableSwipe && count > 1 && !drag.settling
          ? 'cursor-grab'
          : 'cursor-default'
      }` }
      onPointerDown={ drag.onPointerDown }
      onPointerMove={ drag.onPointerMove }
      onPointerUp={ drag.onPointerUp }
      onPointerCancel={ drag.onPointerCancel }
      onLostPointerCapture={ drag.onLostPointerCapture }
      onWheel={ drag.onWheel }
    >
      <div
        className="flex h-full w-full"
        style={ {
          transform: `translate3d(calc(-${
            (count > 1
              ? position
              : 0) * 100
          }% + ${drag.offset}px), 0, 0)`,
          transition: (animate || drag.settling)
            ? `transform ${duration}s ease`
            : 'none',
        } }
        onTransitionEnd={ (event) => {
          if (event.target === event.currentTarget && event.propertyName === 'transform') finishTransition()
        } }
      >
        { slides.map((src, index) => (
          <div key={ `${index}-${src}` } className="relative h-full w-full shrink-0" aria-hidden={ count > 1 && (index === 0 || index === count + 1) }>
            <CarouselImage
              src={ src }
              alt={ count > 1 && (index === 0 || index === count + 1)
                ? ''
                : `Slide ${
                  count > 1
                    ? index
                    : 1
                }` }
              objectFit={ objectFit }
              placeholderImage={ placeholderImage }
            >
              { count > 1 && (index === 0 || index === count + 1)
                ? null
                : children }
            </CarouselImage>
          </div>
        )) }
      </div>
    </div>
  )
})

ContinuousTrack.displayName = 'ContinuousTrack'

type ContinuousTrackProps = {
  imgs: string[]
  currentIndex: number
  direction: number
  duration: number
  objectFit: 'cover' | 'contain' | 'fill'
  placeholderImage?: string
  children?: React.ReactNode
  enableSwipe: boolean
  onNext: () => void
  onPrev: () => void
  onTransitionDone: () => void
}
