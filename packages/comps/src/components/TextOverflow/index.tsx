import type { BaseType } from '@jl-org/tool'
import { handleCssUnit } from '@jl-org/tool'
import { useTextOverflow, vShow } from 'hooks'
import { memo } from 'react'
import { cn } from 'utils'
import { GradientBoundary } from '../GradientBoundary'
import { Tooltip } from '../Tooltip'

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
    fromColor = '#fff',
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
    deps: [children, showAllText],
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

export interface TextOverflowProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode

  /**
   * 是否显示全部文本
   */
  showAllText?: boolean

  /**
   * 显示的行数
   * @default 1
   */
  line?: number
  /**
   * 单行行高
   * @default 1rem
   */
  lineHeight?: BaseType
  /**
   * 渐变边界宽度
   * @default 10rem
   */
  GradientBoundaryWidth?: BaseType
  /**
   * 渐变起始颜色
   * @default #fff
   */
  fromColor?: string
  /**
   * 溢出样式模式
   * - 'ellipsis': 使用省略号（...）
   * - 'gradient': 使用渐变过渡
   * @default 'gradient'
   */
  mode?: 'ellipsis' | 'gradient'
}
