import { memo } from 'react'
import { cn } from 'utils'
import { FONT_SIZE_MULTIPLE } from '../constants'
import type { StepProps, StepsProps } from '../types'
import { StepIcon } from './StepIcon'

export const StepItem = memo<
  StepProps & {
    index: number
    isLast: boolean
    direction: 'horizontal' | 'vertical'
    labelPlacement: 'horizontal' | 'vertical'
    progressDot?: StepsProps['progressDot']
    size?: StepsProps['size']
  }
>((
  {
    title,
    description,
    icon,
    status,
    disabled,
    className,
    index,
    isLast,
    direction,
    labelPlacement,
    progressDot,
    size = 18,
  },
) => {
  const isHorizontal = direction === 'horizontal'
  const isHorizontalLabel = labelPlacement === 'horizontal'

  const stepSize = { width: size, height: size }
  const fontSize = { fontSize: size * FONT_SIZE_MULTIPLE }

  return (
    <div
      className={ cn(
        'flex relative',
        isHorizontal
          ? 'flex-col items-center'
          : 'items-start gap-4',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      ) }
    >
      <div
        className={ cn(
          'flex items-center justify-center rounded-full transition-all duration-300',
          { 'p-0.5': !icon },
          { 'bg-button text-button3': status === 'finish' },
          { 'bg-danger text-white': status === 'error' },
          { 'bg-text/10 text-text border border-text': status === 'process' },
          { 'bg-background3 text-text3': status === 'wait' },
        ) }
        style={ stepSize }
      >
        <StepIcon
          status={ status }
          index={ index }
          icon={ icon }
          progressDot={ progressDot }
          size={ size }
        />
      </div>

      { /* Line */ }
      { !isLast && (
        <div
          className={ cn(
            'transition-all duration-500 ease-in-out',
            isHorizontal
              ? 'h-0.5 flex-1 w-full'
              : 'w-0.5 h-full absolute left-2 top-5',
            status === 'finish'
              ? 'bg-button'
              : 'bg-background3',
          ) }
        />
      ) }

      { title && (
        <div
          className={ cn(
            'flex',
            isHorizontalLabel
              ? 'flex-col'
              : 'flex-row ml-3',
            isHorizontal && !isHorizontalLabel && 'absolute left-10 top-0',
          ) }
        >
          <div
            className={ cn(
              'font-medium',
              status === 'process'
                ? 'text-text'
                : 'text-text3',
              { 'text-text': status === 'finish' },
              { 'text-danger': status === 'error' },
            ) }
            style={ fontSize }
          >
            { title }
          </div>

          { description && !isHorizontal && (
            <div
              className={ cn('text-text3 mt-1') }
              style={ fontSize }
            >
              { description }
            </div>
          ) }
        </div>
      ) }
    </div>
  )
})

StepItem.displayName = 'StepItem'
