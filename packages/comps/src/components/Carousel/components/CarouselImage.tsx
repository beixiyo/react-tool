import type { CarouselProps } from '../types'
import { memo } from 'react'
import { DEFAULT_PLACEHOLDER_IMAGE } from '../constants'
import { handleImageError } from '../utils'

interface CarouselImageProps {
  src: string
  alt: string
  objectFit: CarouselProps['objectFit']
  placeholderImage?: string
  children?: React.ReactNode
}

export const CarouselImage = memo<CarouselImageProps>(({
  src,
  alt,
  objectFit = 'cover',
  placeholderImage = DEFAULT_PLACEHOLDER_IMAGE,
  children,
}) => {
  return (
    <>
      <img
        src={ src }
        alt={ alt }
        className="h-full w-full"
        style={ { objectFit } }
        draggable={ false }
        onError={ e => handleImageError(e, placeholderImage) }
      />
      {children && (
        <div className="absolute inset-0">
          {children}
        </div>
      )}
    </>
  )
})

CarouselImage.displayName = 'CarouselImage'
