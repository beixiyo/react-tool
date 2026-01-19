import type { CarouselProps } from '../types'
import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { DEFAULT_PREVIEW_PLACEHOLDER_IMAGE, PREVIEW_ANIMATION_DELAY, PREVIEW_SIZES } from '../constants'
import { handleImageError } from '../utils'

interface PreviewImage {
  index: number
  src: string
}

interface CarouselPreviewProps {
  previews: PreviewImage[]
  currentIndex: number
  previewPosition: CarouselProps['previewPosition']
  objectFit: CarouselProps['objectFit']
  onPreviewClick: (index: number) => void
  previewPlaceholderImage?: string
}

export const CarouselPreview = memo<CarouselPreviewProps>(({
  previews,
  currentIndex,
  previewPosition = 'right',
  objectFit = 'cover',
  onPreviewClick,
  previewPlaceholderImage = DEFAULT_PREVIEW_PLACEHOLDER_IMAGE,
}) => {
  const sizes = PREVIEW_SIZES[previewPosition]

  return (
    <div
      className={ cn(
        'flex gap-4 overflow-hidden',
        previewPosition === 'right'
          ? 'absolute right-4 top-1/2 -translate-y-1/2 flex-col'
          : previewPosition === 'bottom'
            ? 'mt-4 flex-row justify-center'
            : '',
      ) }
    >
      {previews.map((preview, index) => (
        <motion.div
          key={ `${preview.index}-${currentIndex}` }
          initial={ { opacity: 0, scale: 0.9 } }
          animate={ { opacity: 1, scale: 1 } }
          transition={ { delay: index * PREVIEW_ANIMATION_DELAY } }
          className="group relative cursor-pointer"
          onClick={ () => onPreviewClick(preview.index) }
        >
          <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105">
            <img
              src={ preview.src }
              alt={ `Preview ${preview.index + 1}` }
              className="h-full w-full"
              style={ {
                objectFit,
                ...sizes,
              } }
              onError={ e => handleImageError(e, previewPlaceholderImage) }
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
})

CarouselPreview.displayName = 'CarouselPreview'
