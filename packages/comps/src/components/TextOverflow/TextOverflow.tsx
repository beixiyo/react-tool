import { handleCssUnit } from '@jl-org/tool'
import { useTextOverflow, vShow } from 'hooks'
import { memo } from 'react'
import { cn } from 'utils'
import { GradientBoundary } from '../GradientBoundary'
import { Tooltip } from '../Tooltip'
import type { TextOverflowProps } from './types'

/**
 * 文本溢出省略，支持省略号或渐变过渡两种模式
 */
export const TextOverflow = memo((
  {
    style,
    className,
    children,

    line = 1,
    lineHeight = '1.5rem',
    GradientBoundaryWidth = '10rem',
    fromColor = 'rgb(var(--background) / 1)',
    showAllText = false,
    mode = 'gradient',
  }: TextOverflowProps,
) => {
  lineHeight = handleCssUnit(lineHeight)

  const {
    contentRef,
    isOverflowing,
    tooltipContent,
  } = useTextOverflow({
    children,
    showAllText,
    checkVertical: true,
    deps: [showAllText],
  })

  /** 是否使用省略号模式 */
  const isEllipsisMode = mode === 'ellipsis'

  return (
    <Tooltip
      content={ tooltipContent }
      placement="top"
      trigger="hover"
      disabled={ !isOverflowing || !tooltipContent || showAllText }
      className={ cn(className, 'block min-w-0') }
    >
      <div
        ref={ contentRef as React.RefObject<HTMLDivElement | null> }
        className={ cn(
          'relative overflow-hidden min-w-0',
          isEllipsisMode && !showAllText && line === 1 && 'truncate',
        ) }
        style={ {
          lineHeight,
          height: showAllText
            ? undefined
            : isEllipsisMode && line === 1
            ? undefined
            : `calc(${line} * ${lineHeight})`,
          ...(isEllipsisMode && !showAllText && line > 1
            ? {
              display: '-webkit-box',
              WebkitLineClamp: line,
              WebkitBoxOrient: 'vertical',
            }
            : {}),
          ...style,
        } }
      >
        { children }

        { !isEllipsisMode && (
          <GradientBoundary
            fromColor={ fromColor }
            style={ {
              height: lineHeight,
              width: GradientBoundaryWidth,
              ...vShow(!showAllText),
            } }
            direction="right"
          />
        ) }
      </div>
    </Tooltip>
  )
})

TextOverflow.displayName = 'TextOverflow'
