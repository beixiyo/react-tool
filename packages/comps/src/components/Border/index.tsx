'use client'

import type { CSSProperties, RefObject } from 'react'
import { useElBounding } from 'hooks'
import { memo, useRef, useState } from 'react'
import { cn } from 'utils'
import styles from './styles.module.css'

export const Border = memo((props: BorderProps) => {
  const {
    dashLength = 10,
    dashGap = 12,
    strokeColor = 'rgb(var(--border) / 1)',
    hoverStrokeColor = 'rgb(var(--brand) / 1)',
    strokeWidth = 2,
    animated = true,
    enterAnimate = true,
    animationSpeed = 50,
    borderRadius = 20,
    className,
    children,
    style,
  } = props

  const [isEnter, setIsEnter] = useState(false)
  const elRef = useRef<HTMLDivElement>(null)
  const elBounds = useElBounding(elRef as RefObject<HTMLElement>)

  /**
   * 流动动画是否激活：纯 CSS 驱动（合成线程），不再用 setInterval + setState 每帧重渲染。
   * 一个完整周期的偏移量为 dashLength + dashGap，周期时长沿用 animationSpeed 的语义
   * （原逻辑每 animationSpeed 毫秒推进 1 像素）。
   */
  const isFlowing = animated && (!enterAnimate || isEnter)
  const dashCycle = dashLength + dashGap
  const flowStyle: CSSProperties = {
    '--dash-cycle': `${-dashCycle}`,
    '--dash-duration': `${dashCycle * animationSpeed}ms`,
  } as CSSProperties

  return (
    <div
      ref={ elRef }
      className={ cn('relative w-full h-full') }
      onMouseEnter={ () => setIsEnter(true) }
      onMouseMove={ () => setIsEnter(true) }
      onMouseLeave={ () => setIsEnter(false) }
      onMouseOut={ () => setIsEnter(false) }
      style={ style }
    >
      {/* SVG边框 */ }
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={ strokeWidth / 2 }
          y={ strokeWidth / 2 }
          width={ Math.max(0, elBounds.width - strokeWidth) }
          height={ Math.max(0, elBounds.height - strokeWidth) }
          rx={ borderRadius }
          ry={ borderRadius }
          fill="none"
          stroke={
            isEnter
              ? hoverStrokeColor
              : strokeColor
          }
          strokeWidth={ strokeWidth }
          strokeDasharray={ `${dashLength},${dashGap}` }
          style={ isFlowing
            ? flowStyle
            : undefined }
          className={ cn(
            'transition-all duration-300',
            isFlowing && styles.flow,
          ) }
        />
      </svg>

      {/* 内容区域 */ }
      <div
        className={ cn('h-full w-full', className) }
        style={ {
          padding: `${strokeWidth}px`,
          borderRadius: `${borderRadius}px`,
        } }
      >
        { children }
      </div>
    </div>
  )
})

Border.displayName = 'Border'

export type BorderProps = {
  /**
   * 虚线段的长度
   * @default 10
   */
  dashLength?: number
  /**
   * 虚线段之间的间距
   * @default 12
   */
  dashGap?: number
  /**
   * 边框颜色
   *
   * 默认值依赖设计 token CSS 变量 `--border`，下游整包拷贝时需在主题中提供该变量，
   * 否则颜色会失效，可直接传入具体颜色值覆盖。
   * @default 'rgb(var(--border) / 1)'
   */
  strokeColor?: string
  /**
   * 边框颜色（鼠标悬停）
   *
   * 默认值依赖设计 token CSS 变量 `--brand`，下游整包拷贝时需在主题中提供该变量，
   * 否则悬停颜色会失效，可直接传入具体颜色值覆盖。
   * @default 'rgb(var(--brand) / 1)'
   */
  hoverStrokeColor?: string
  /**
   * 边框宽度
   * @default 2
   */
  strokeWidth?: number
  /**
   * 是否启用流动动画
   * @default true
   */
  animated?: boolean
  /**
   * 鼠标进入时才触发动画
   * @default true
   */
  enterAnimate?: boolean
  /**
   * 动画速度（毫秒）
   * @default 50
   */
  animationSpeed?: number
  /**
   * 边框圆角半径
   * @default 20
   */
  borderRadius?: number
}
& React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
