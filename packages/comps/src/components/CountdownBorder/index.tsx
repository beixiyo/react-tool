import type { MotionValue } from 'motion/react'
import { clamp } from '@jl-org/tool'
import { useLatestCallback } from 'hooks'
import { animate, motion, useMotionValue } from 'motion/react'
import { memo, useEffect, useMemo } from 'react'
import { cn } from 'utils'

const DEFAULT_WIDTH = 360
const DEFAULT_HEIGHT = 64
const DEFAULT_RADIUS = 16
const DEFAULT_STROKE_WIDTH = 2

export const CountdownBorder = memo<CountdownBorderProps>((props) => {
  const {
    children,
    className,
    style,
    contentClassName,
    svgClassName,
    pathClassName,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    radius = DEFAULT_RADIUS,
    strokeWidth = DEFAULT_STROKE_WIDTH,
    startX = width * 0.35,
    progress,
    duration = 8000,
    running = true,
    resetKey,
    strokeLinecap = 'round',
    onComplete,
    ...rest
  } = props

  const internalProgress = useMotionValue(1)
  const controlledProgress = useMotionValue(typeof progress === 'number'
    ? clamp(progress, 0, 1)
    : 1)
  const displayProgress = typeof progress === 'number'
    ? controlledProgress
    : progress ?? internalProgress
  const handleComplete = useLatestCallback(() => onComplete?.())

  const path = useMemo(() => {
    return getCountdownBorderPath({
      width,
      height,
      radius,
      strokeWidth,
      startX,
    })
  }, [height, radius, startX, strokeWidth, width])

  useEffect(() => {
    if (progress === undefined)
      internalProgress.set(1)
  }, [internalProgress, progress, resetKey])

  useEffect(() => {
    if (typeof progress === 'number')
      controlledProgress.set(clamp(progress, 0, 1))
  }, [controlledProgress, progress])

  useEffect(() => {
    if (progress !== undefined || !running)
      return

    const currentProgress = internalProgress.get()
    if (currentProgress <= 0)
      return

    const controls = animate(internalProgress, 0, {
      duration: (duration / 1000) * currentProgress,
      ease: 'linear',
      onComplete: handleComplete,
    })

    return () => controls.stop()
  }, [duration, handleComplete, internalProgress, progress, resetKey, running])

  return (
    <div
      className={ cn(
        'relative overflow-hidden rounded-2xl bg-background',
        className,
      ) }
      style={ {
        width,
        height,
        borderRadius: radius,
        ...style,
      } }
      { ...rest }
    >
      <svg
        className={ cn(
          'pointer-events-none absolute inset-0 size-full overflow-hidden',
          svgClassName,
        ) }
        viewBox={ `0 0 ${width} ${height}` }
        aria-hidden="true"
        style={ { borderRadius: radius } }
      >
        <motion.path
          d={ path }
          className={ cn('stroke-brand', pathClassName) }
          fill="none"
          strokeWidth={ strokeWidth }
          strokeLinecap={ strokeLinecap }
          style={ { pathLength: displayProgress } }
        />
      </svg>

      <div className={ cn('relative z-10 h-full', contentClassName) }>
        {children}
      </div>
    </div>
  )
})

CountdownBorder.displayName = 'CountdownBorder'

function getCountdownBorderPath(options: CountdownBorderPathOptions) {
  const { width, height, radius, strokeWidth, startX } = options
  const inset = strokeWidth / 2
  const left = inset
  const top = inset
  const right = width - inset
  const bottom = height - inset
  const safeRadius = Math.max(0, Math.min(radius - inset, (width - strokeWidth) / 2, (height - strokeWidth) / 2))
  const safeStartX = Math.min(Math.max(startX, left + safeRadius), right - safeRadius)

  return [
    `M ${safeStartX} ${top}`,
    `H ${right - safeRadius}`,
    `Q ${right} ${top} ${right} ${top + safeRadius}`,
    `V ${bottom - safeRadius}`,
    `Q ${right} ${bottom} ${right - safeRadius} ${bottom}`,
    `H ${left + safeRadius}`,
    `Q ${left} ${bottom} ${left} ${bottom - safeRadius}`,
    `V ${top + safeRadius}`,
    `Q ${left} ${top} ${left + safeRadius} ${top}`,
    `H ${safeStartX}`,
  ].join(' ')
}

type CountdownBorderPathOptions = {
  width: number
  height: number
  radius: number
  strokeWidth: number
  startX: number
}

export type CountdownBorderProps = {
  /**
   * 边框视图宽度
   * @default 360
   */
  width?: number
  /**
   * 边框视图高度
   * @default 64
   */
  height?: number
  /**
   * 圆角半径
   * @default 16
   */
  radius?: number
  /**
   * 描边宽度
   * @default 2
   */
  strokeWidth?: number
  /**
   * 顶边起点横坐标
   * @default width * 0.35
   */
  startX?: number
  /**
   * 受控进度，取值 0-1；不传时组件按 duration 自动倒计时
   */
  progress?: number | MotionValue<number>
  /**
   * 自动倒计时时长，单位毫秒
   * @default 8000
   */
  duration?: number
  /**
   * 自动倒计时是否运行
   * @default true
   */
  running?: boolean
  /**
   * 变化时重置非受控倒计时
   */
  resetKey?: React.Key
  /**
   * SVG path 线帽
   * @default 'round'
   */
  strokeLinecap?: React.SVGAttributes<SVGPathElement>['strokeLinecap']
  /**
   * 内容区域 className
   */
  contentClassName?: string
  /**
   * SVG 元素 className
   */
  svgClassName?: string
  /**
   * 倒计时 path className
   * @default 'stroke-brand'
   */
  pathClassName?: string
  /**
   * 非受控倒计时结束回调
   */
  onComplete?: () => void
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
