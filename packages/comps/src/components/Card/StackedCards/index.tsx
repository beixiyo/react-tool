import type { StackedCardsProps } from './types'
import { memo } from 'react'
import { cn } from 'utils'

function StackedCardsBase(props: StackedCardsProps) {
  const {
    layers = 3,
    autoHeight = false,
    layersContent,
    offsetX = 0,
    offsetY = 8,
    scaleStep = 0.03,
    opacityStep = 0.08,
    zIndexBase = 0,
    className,
    layerClassName,
    topLayerClassName,
    contentClassName,
    style,
    children,
    ...rest
  } = props

  const normalizedLayers = Math.min(Math.max(layers, 1), 3) as 1 | 2 | 3

  return (
    <div
      { ...rest }
      className={ cn('relative', className) }
      style={ style }
    >
      { Array.from({ length: normalizedLayers }).map((_, index) => {
        const depth = normalizedLayers - 1 - index
        const isTop = depth === 0
        const translateX = offsetX * depth
        const translateY = offsetY * depth
        const scale = 1 - scaleStep * depth
        const opacity = Math.max(0, 1 - opacityStep * depth)
        const isInFlow = autoHeight && isTop
        const layerContent = layersContent?.[depth]
        const resolvedContent = typeof layerContent === 'undefined'
          ? (isTop
              ? children
              : null)
          : layerContent

        return (
          <div
            key={ index }
            aria-hidden={ !isTop }
            className={ cn(
              isInFlow
                ? 'relative'
                : 'absolute inset-0',
              'overflow-hidden rounded-xl border border-border bg-backgroundSecondary transition-[transform,opacity,box-shadow] duration-300 ease-out',
              isTop
                ? 'shadow-sm'
                : 'shadow-none pointer-events-none',
              layerClassName,
              isTop && topLayerClassName,
            ) }
            style={ {
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              opacity,
              zIndex: zIndexBase + index,
            } }
          >
            { resolvedContent !== null && resolvedContent !== undefined && resolvedContent !== false && (
              <div className={ cn('relative h-full w-full', contentClassName) }>
                { resolvedContent }
              </div>
            ) }
          </div>
        )
      }) }
    </div>
  )
}

export const StackedCards = memo(StackedCardsBase) as typeof StackedCardsBase
