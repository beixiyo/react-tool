import type { BaseType } from '@jl-org/tool'
import { handleCssUnit } from '@jl-org/tool'
import { vShow } from 'hooks'
import { memo } from 'react'
import { cn } from 'utils'
import { GradientBoundary } from '../GradientBoundary'

/**
 * 文本溢出省略，用透明边界代替
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
  }: TextOverflowProps,
) => {
  lineHeight = handleCssUnit(lineHeight)

  return (
    <div
      className={ cn(
        'relative overflow-hidden',
        className,
      ) }
      style={ {
        lineHeight,
        height: showAllText
          ? undefined
          : `calc(${line} * ${lineHeight})`,
        ...style,
      } }
    >
      { children }

      <GradientBoundary
        fromColor={ fromColor }
        style={ {
          height: lineHeight,
          width: GradientBoundaryWidth,
          ...vShow(!showAllText),
        } }
      />
    </div>
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
}
