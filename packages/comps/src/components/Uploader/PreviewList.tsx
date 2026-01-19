import type { PreviewConfig, UploaderProps } from './types'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { Border } from '../Border'
import { CloseBtn } from '../CloseBtn'
import { LazyImg } from '../LazyImg'
import { getStrokeColor } from './utils'

export interface PreviewListProps {
  previewImgs?: string[]
  mode: UploaderProps['mode']
  disabled?: boolean
  maxCount?: number
  previewConfig?: PreviewConfig
  onRemove?: (index: number) => void
  onTriggerClick?: () => void
  dragActive?: boolean
  dragInvalid?: boolean
  className?: string
}

export const PreviewList = memo<PreviewListProps>((props) => {
  const {
    previewImgs,
    mode,
    disabled,
    maxCount,
    previewConfig,
    onRemove,
    onTriggerClick,
    dragActive = false,
    dragInvalid = false,
    className,
  } = props

  const isCardMode = mode === 'card'
  if (!previewImgs?.length && !isCardMode)
    return null

  const config = {
    width: 70,
    height: 70,
    ...previewConfig,
  }

  const defaultRenderItem = ({ src, index, onRemove }: { src: string, index: number, onRemove: () => void }) => (
    <motion.div
      key={ index }
      layout
      initial={ { scale: 0.8, opacity: 0 } }
      animate={ { scale: 1, opacity: 1 } }
      exit={ { scale: 0.8, opacity: 0 } }
      transition={ { duration: 0.2, delay: index * 0.05 } }
      className={ cn(
        'relative flex items-center justify-center',
        'border border-border rounded-lg',
        'bg-background shadow-xs',
        'transition-all duration-200',
        {
          'hover:shadow-md hover:border-borderStrong': !disabled,
          'opacity-75': disabled,
        },
      ) }
      style={ {
        width: config.width,
        height: config.height,
      } }
    >
      <LazyImg
        lazy={ false }
        src={ src }
        alt={ `预览图片 ${index + 1}` }
        className="h-full w-full rounded-lg object-cover"
        previewImages={ previewImgs }
      />

      { !disabled && <CloseBtn onClick={ onRemove } size="md" /> }
    </motion.div>
  )

  const renderAddTrigger = () => (
    <motion.div
      key="add-trigger"
      layout
      initial={ { scale: 0.8, opacity: 0 } }
      animate={ { scale: 1, opacity: 1 } }
      exit={ { scale: 0.8, opacity: 0 } }
      onClick={ onTriggerClick }
      className={ cn(
        'relative flex items-center justify-center',
        'transition-all duration-200',
        {
          'cursor-pointer': !disabled,
          'cursor-not-allowed opacity-50': disabled,
        },
      ) }
      style={ {
        width: config.width,
        height: config.height,
      } }
    >
      <Border
        borderRadius={ 8 }
        strokeWidth={ 1 }
        animated={ !disabled }
        className="flex items-center justify-center"
        strokeColor={ getStrokeColor({ disabled, dragActive, dragInvalid }) }
        hoverStrokeColor={
          disabled
            ? 'rgb(var(--textDisabled) / 1)'
            : 'rgb(var(--success) / 1)'
        }
      >
        <Plus className={ cn(
          'size-6 transition-colors',
          disabled
            ? 'text-textDisabled'
            : 'text-textQuaternary group-hover:text-textSecondary',
        ) } />
      </Border>
    </motion.div>
  )

  return (
    <motion.div
      initial={ isCardMode
        ? false
        : { opacity: 0, y: 10 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.3 } }
      className={ cn(
        'overflow-auto flex flex-wrap gap-3 sm:gap-4 shrink-0 w-full',
        'scrollbar-thin scrollbar-thumb-borderStrong',
        'scrollbar-track-transparent',
        !isCardMode && 'mt-4',
        className,
      ) }
      style={ {
        maxHeight: isCardMode
          ? undefined
          : config.height * 2,
      } }
    >
      <AnimatePresence mode="popLayout">
        { previewImgs?.map((base64, index) =>
          config.renderItem
            ? config.renderItem({
                src: base64,
                index,
                onRemove: () => onRemove?.(index),
              })
            : defaultRenderItem({
                src: base64,
                index,
                onRemove: () => onRemove?.(index),
              }),
        ) }
        { isCardMode && (!maxCount || (previewImgs?.length || 0) < maxCount) && renderAddTrigger() }
      </AnimatePresence>
    </motion.div>
  )
})

PreviewList.displayName = 'PreviewList'
