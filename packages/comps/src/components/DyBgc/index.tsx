'use client'

import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import './dyBgc.css'

/***************************************************
 *                    constants
 ***************************************************/
/** 关键帧基准色块尺寸（每段对应一个颜色层），共 5 个基准模式 */
const BASE_BACKGROUND_SIZE: Value[] = [[1.3, 1.3], [0.8, 0.8], [0.9, 0.9], [1.1, 1.1], [0.9, 0.9]]
/** 关键帧基准色块位置，共 5 个基准模式 */
const BASE_BACKGROUND_POSITION: Value[] = [[-0.8, -0.8], [0.6, -0.3], [0.1, 0.1], [-0.3, -0.1], [0.5, 0.5]]

const BASE_SIZES: Size = {
  0: BASE_BACKGROUND_SIZE,
  25: [[1.0, 1.0], [0.9, 0.9], [1.0, 1.0], [0.9, 0.9], [0.6, 0.6]],
  50: [[0.8, 0.8], [1.1, 1.1], [0.8, 0.8], [0.6, 0.6], [0.8, 0.8]],
  75: [[0.9, 0.9], [0.9, 0.9], [1.0, 1.0], [0.9, 0.9], [0.7, 0.7]],
}

const BASE_POSITIONS: Size = {
  0: BASE_BACKGROUND_POSITION,
  25: [[-0.6, -0.9], [0.5, -0.4], [0.0, -0.2], [-0.4, -0.2], [0.4, 0.6]],
  50: [[-0.5, -0.7], [0.4, -0.3], [0.1, 0.0], [0.2, 0.1], [0.3, 0.7]],
  75: [[-0.5, -0.4], [0.5, -0.3], [0.2, 0.0], [-0.1, 0.1], [0.4, 0.6]],
}

/**
 * 将基准模式（定长 5）调整为与颜色数量一致的段数：
 * 超出部分对基准取模复用，不足部分截断，保证 gradient 层数与 size/position 段数始终对齐
 */
function fitToCount(base: Value[], count: number): Value[] {
  if (count <= 0)
    return []

  return Array.from({ length: count }, (_, i) => base[i % base.length])
}

function toStyleString(values: Value[], maxSize: number) {
  return values
    .map(([start, end]) => `${start * maxSize}px ${end * maxSize}px`)
    .join(', ')
}

export const DyBgc = memo<DyBgcProps>(({
  children,
  colors = [
    ['rgba(235, 105, 78, 1)', 'rgba(235, 105, 78, 0)'],
    ['rgba(243, 11, 164, 1)', 'rgba(243, 11, 164, 0)'],
    ['rgba(254, 234, 131, 1)', 'rgba(254, 234, 131, 0)'],
    ['rgba(170, 142, 245, 1)', 'rgba(170, 142, 245, 0)'],
    ['rgba(248, 192, 147, 1)', 'rgba(248, 192, 147, 0)'],
  ],
  blurAmount = 10,
  animationDuration = 10,

  className,
  containerClassName,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [maxSize, setMaxSize] = useState(0)

  const count = colors.length

  /***************************************************
   *                    styles
   ***************************************************/
  const { backgroundSize, backgroundPosition, cssVarStyle } = useMemo(() => {
    const backgroundSize = toStyleString(fitToCount(BASE_BACKGROUND_SIZE, count), maxSize)
    const backgroundPosition = toStyleString(fitToCount(BASE_BACKGROUND_POSITION, count), maxSize)

    const cssVarStyle = {
      '--size0': toStyleString(fitToCount(BASE_SIZES[0], count), maxSize),
      '--size25': toStyleString(fitToCount(BASE_SIZES[25], count), maxSize),
      '--size50': toStyleString(fitToCount(BASE_SIZES[50], count), maxSize),
      '--size75': toStyleString(fitToCount(BASE_SIZES[75], count), maxSize),

      '--pos0': toStyleString(fitToCount(BASE_POSITIONS[0], count), maxSize),
      '--pos25': toStyleString(fitToCount(BASE_POSITIONS[25], count), maxSize),
      '--pos50': toStyleString(fitToCount(BASE_POSITIONS[50], count), maxSize),
      '--pos75': toStyleString(fitToCount(BASE_POSITIONS[75], count), maxSize),
    } as React.CSSProperties

    return { backgroundSize, backgroundPosition, cssVarStyle }
  }, [maxSize, count])

  const backgroundImage = useMemo(
    () => colors
      .map(([start, end]) => `radial-gradient(closest-side, ${start}, ${end})`)
      .join(', '),
    [colors],
  )

  /**
   * calc size max
   */
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setMaxSize(Math.max(width, height))
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current)
      observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ containerRef }
      className={ cn(
        'relative h-full w-full overflow-hidden',
        containerClassName,
      ) }
      style={ {
        ...style,
        ...cssVarStyle,
      } }
    >
      {/* 动态背景色块 */ }
      <div
        className="absolute inset-0"
        style={ {
          backgroundImage,
          backgroundRepeat: 'no-repeat',
          backgroundSize,
          backgroundPosition,
          animation: `${animationDuration}s movement linear infinite`,
        } }
      />

      {/* 模糊 */ }
      <div
        className="absolute inset-0"
        style={ {
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
        } }
      />

      <div className={ cn(
        'absolute inset-0 z-5',
        className,
      ) }>
        { children }
      </div>
    </div>
  )
})

DyBgc.displayName = 'DyBgc'

export type DyBgcProps = {
  children?: React.ReactNode
  /**
   * 渐变色块数组，每项为 [起始色, 结束色]
   * 段数可任意，内部会按数量自动复用/截断关键帧基准模式
   * @default 5 组预设彩色渐变
   */
  colors?: ColorValue[]
  /**
   * 背景模糊半径（像素）
   * @default 10
   */
  blurAmount?: number
  /**
   * 动画时长（秒）
   * @default 10
   */
  animationDuration?: number
  /**
   * 最外层容器类名
   */
  containerClassName?: string
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>

type ColorValue = [FromColor: string, ToColor: string]
type Value = [Start: number, End: number]
type Size = {
  0: Value[]
  25: Value[]
  50: Value[]
  75: Value[]
}
