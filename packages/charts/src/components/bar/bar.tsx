'use client'

import type { AnimatedBarProps, BarProps } from './types'
import { motion } from 'motion/react'
import { memo, useEffect, useId, useMemo, useState } from 'react'
import { chartCssVars, useChartInteraction, useChartStatic } from '../chart-context'
import { BAR_EASING } from '../constants'

function AnimatedBar({
  x,
  y,
  width,
  height,
  fill,
  rx,
  ry,
  index,
  isFaded,
  animationType,
  innerHeight,
  fadedOpacity,
  staggerDelay,
  animationDuration,
  isHorizontal,
}: AnimatedBarProps) {
  const [isAnimated, setIsAnimated] = useState(false)

  /** 在交错延迟后触发动画 */
  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setIsAnimated(true)
      },
      index * staggerDelay * 1000,
    )
    return () => clearTimeout(timeout)
  }, [index, staggerDelay])

  /**
   * 计算此柱子的动画持续时间
   * 每个柱子获得剩余时间的比例份额
   */
  const barDuration = animationDuration * 0.6 // 动画本身占总持续时间的 60%

  /** 计算淡入淡出动画的不透明度（避免嵌套三元运算符） */
  const getFadeOpacity = () => {
    if (isFaded) {
      return fadedOpacity
    }
    return isAnimated
      ? 1
      : 0
  }

  if (animationType === 'fade') {
    return (
      <motion.rect
        animate={ {
          opacity: getFadeOpacity(),
          filter: isAnimated
            ? 'blur(0px)'
            : 'blur(2px)',
        } }
        fill={ fill }
        height={ height }
        initial={ { opacity: 0, filter: 'blur(2px)' } }
        rx={ rx }
        ry={ ry }
        style={ {
          transition: `opacity ${barDuration}ms ${BAR_EASING}, filter ${barDuration}ms ${BAR_EASING}`,
        } }
        transition={ {
          opacity: { duration: 0.15 },
        } }
        width={ width }
        x={ x }
        y={ y }
      />
    )
  }

  // "grow" 动画 - 柱子使用 CSS 过渡从原点生长
  const animatedProps = isHorizontal
    ? {
        width: isAnimated
          ? width
          : 0,
        height,
        x: 0,
        y,
      }
    : {
        width,
        height: isAnimated
          ? height
          : 0,
        x,
        y: isAnimated
          ? y
          : innerHeight,
      }

  return (
    <motion.rect
      animate={ {
        opacity: isFaded
          ? fadedOpacity
          : 1,
      } }
      fill={ fill }
      height={ animatedProps.height }
      rx={ rx }
      ry={ ry }
      style={ {
        transition: `width ${barDuration}ms ${BAR_EASING}, height ${barDuration}ms ${BAR_EASING}, x ${barDuration}ms ${BAR_EASING}, y ${barDuration}ms ${BAR_EASING}`,
      } }
      transition={ {
        opacity: { duration: 0.15 },
      } }
      width={ animatedProps.width }
      x={ animatedProps.x }
      y={ animatedProps.y }
    />
  )
}

function BarInner({
  dataKey,
  fill = chartCssVars.linePrimary,
  lineCap = 'round',
  animate = true,
  animationType = 'grow',
  fadedOpacity = 0.3,
  staggerDelay,
  stackGap = 0,
  groupGap = 4,
}: BarProps) {
  const {
    data,
    yScale,
    innerHeight,
    isLoaded,
    barScale,
    bandWidth,
    barXAccessor,
    lines,
    orientation,
    stacked,
    stackOffsets,
    animationDuration,
  } = useChartStatic()
  const {
    hoveredBarIndex,
    setHoveredBarIndex,
  } = useChartInteraction()

  /**
   * 如果未提供交错延迟，则自动计算
   * 总动画持续时间约为 1200ms，其中 40% 用于交错扩散，60% 用于柱子动画
   */
  const totalAnimDuration = animationDuration || 1100
  const staggerSpread = totalAnimDuration * 0.4 // 40% 的时间用于交错扩散
  const calculatedStaggerDelay
    = staggerDelay ?? (data.length > 1
      ? staggerSpread / 1000 / data.length
      : 0)
  const uniqueId = useId().replace(/:/g, '_')

  const isHorizontal = orientation === 'horizontal'

  /** 在所有柱子系列中查找此柱子系列的索引 */
  const seriesIndex = useMemo(() => {
    const idx = lines.findIndex(l => l.dataKey === dataKey)
    return idx >= 0
      ? idx
      : 0
  }, [lines, dataKey])

  const seriesCount = lines.length
  const isLastSeries = seriesIndex === seriesCount - 1

  /** 计算组内每个柱子的宽度（用于非堆叠） */
  const barWidth = useMemo(() => {
    if (!bandWidth || seriesCount === 0) {
      return 0
    }
    if (stacked) {
      /** 堆叠柱子使用完整带宽 */
      return bandWidth
    }
    /** 在分组柱子之间留出间隙（由 groupGap prop 控制） */
    const effectiveGroupGap = seriesCount > 1
      ? groupGap
      : 0
    return (bandWidth - effectiveGroupGap * (seriesCount - 1)) / seriesCount
  }, [bandWidth, seriesCount, stacked, groupGap])

  /** 根据 lineCap 计算圆角半径 */
  const cornerRadius = useMemo(() => {
    if (typeof lineCap === 'number') {
      return lineCap
    }
    if (lineCap === 'round' && barWidth) {
      return Math.min(barWidth / 2, 8)
    }
    return 0
  }, [lineCap, barWidth])

  /** 如果柱子比例尺不可用（不在 BarChart 中），则提前返回 */
  if (!(barScale && bandWidth && barXAccessor)) {
    console.warn('Bar component must be used within a BarChart')
    return null
  }

  return (
    <g className={ `bar-series-${uniqueId}` }>
      { data.map((d, i) => {
        const value = d[dataKey]
        const numValue = Number(value)
        if (Number.isNaN(numValue) || value == null || value === '') {
          return null
        }

        const categoryValue = barXAccessor(d)
        const bandPos = barScale(categoryValue) ?? 0

        let x: number
        let y: number
        let barHeight: number
        let barW: number

        if (isHorizontal) {
          /** 水平柱状图：类别在 y 轴，值在 x 轴 */
          const valuePos = yScale(numValue) ?? 0
          barW = valuePos // 宽度直接等于值映射后的像素位置（从原点向右生长）
          barHeight = barWidth

          if (stacked && stackOffsets) {
            const offset = stackOffsets.get(i)?.get(dataKey) ?? 0
            x = yScale(offset) ?? 0
            barW = valuePos - x
            /** 对水平柱子应用堆叠间隙：向右移动并减少宽度 */
            const gapOffset = seriesIndex * stackGap
            x += gapOffset
            if (!isLastSeries && stackGap > 0) {
              barW = Math.max(0, barW - stackGap)
            }
          }
          else {
            x = 0
            /** 对于分组柱子，偏移 y 位置 */
            const effectiveGroupGap = seriesCount > 1
              ? groupGap
              : 0
            y = bandPos + seriesIndex * (barWidth + effectiveGroupGap)
          }
          y = stacked
            ? bandPos
            : bandPos
              + seriesIndex * (barWidth + (seriesCount > 1
                ? groupGap
                : 0))
        }
        else {
          /** 垂直柱状图：类别在 x 轴，值在 y 轴 */
          const valuePos = yScale(numValue) ?? 0
          barHeight = innerHeight - valuePos
          barW = barWidth

          if (stacked && stackOffsets) {
            const offset = stackOffsets.get(i)?.get(dataKey) ?? 0
            const offsetY = yScale(offset) ?? innerHeight
            /** 应用堆叠间隙：向上移动并减少高度 */
            const gapOffset = seriesIndex * stackGap
            y = offsetY - barHeight - gapOffset
            // Reduce height slightly for non-last bars to create visual gap
            if (!isLastSeries && stackGap > 0) {
              barHeight = Math.max(0, barHeight - stackGap)
            }
          }
          else {
            y = valuePos
            /** 对于分组柱子，偏移 x 位置 */
            const effectiveGroupGap = seriesCount > 1
              ? groupGap
              : 0
            x = bandPos + seriesIndex * (barWidth + effectiveGroupGap)
          }
          x = stacked
            ? bandPos
            : bandPos
              + seriesIndex * (barWidth + (seriesCount > 1
                ? groupGap
                : 0))
        }

        const isFaded = hoveredBarIndex !== null && hoveredBarIndex !== i

        /** 使用 categoryValue 作为键，因为它是数据中的唯一标识符 */
        const barKey = `bar-${dataKey}-${categoryValue}`

        /** 应用圆角： */
        // - 对于非堆叠：始终应用
        // - 对于带间隙的堆叠：应用于所有柱子
        // - 对于不带间隙的堆叠：仅应用于最后一个系列
        const applyRounding = !stacked || stackGap > 0 || isLastSeries
        const effectiveRx = applyRounding
          ? cornerRadius
          : 0
        const effectiveRy = applyRounding
          ? cornerRadius
          : 0

        if (animate && !isLoaded) {
          return (
            <AnimatedBar
              animationDuration={ totalAnimDuration }
              animationType={ animationType }
              fadedOpacity={ fadedOpacity }
              fill={ fill }
              height={ barHeight }
              index={ i }
              innerHeight={ innerHeight }
              isFaded={ isFaded }
              isHorizontal={ isHorizontal }
              key={ barKey }
              rx={ effectiveRx }
              ry={ effectiveRy }
              staggerDelay={ calculatedStaggerDelay }
              width={ barW }
              x={ x }
              y={ y }
            />
          )
        }

        /** 动画完成后的静态柱子 */
        return (
          <motion.rect
            animate={ {
              opacity: isFaded
                ? fadedOpacity
                : 1,
            } }
            fill={ fill }
            height={ barHeight }
            key={ barKey }
            onMouseEnter={ () => setHoveredBarIndex?.(i) }
            onMouseLeave={ () => setHoveredBarIndex?.(null) }
            rx={ effectiveRx }
            ry={ effectiveRy }
            style={ {
              cursor: 'pointer',
            } }
            transition={ {
              opacity: { duration: 0.15 },
            } }
            width={ barW }
            x={ x }
            y={ y }
          />
        )
      }) }
    </g>
  )
}

export const Bar = memo(BarInner)

Bar.displayName = 'Bar'
