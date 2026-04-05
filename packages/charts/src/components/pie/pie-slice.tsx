'use client'

import type { PieSliceProps } from './types'
import { arc as arcGenerator } from '@visx/shape'
import { motion, useSpring, useTransform } from 'motion/react'
import { memo, useEffect, useRef } from 'react'
import { usePie } from './pie-context'

function generateArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number,
  padAngle: number,
): string {
  const generator = arcGenerator<unknown>({
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle,
  })
  return generator({ startAngle, endAngle } as unknown as null) || ''
}

function getSliceOffset(
  startAngle: number,
  endAngle: number,
  distance: number,
): { x: number, y: number } {
  const midAngle = (startAngle + endAngle) / 2
  return {
    x: Math.sin(midAngle) * distance,
    y: -Math.cos(midAngle) * distance,
  }
}

interface AnimatedSliceTranslateProps {
  index: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  cornerRadius: number
  padAngle: number
  fill: string
  color: string
  isHovered: boolean
  isFaded: boolean
  animationKey: number
  showGlow: boolean
  hoverOffset: number
}

function AnimatedSliceTranslate({
  index,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  cornerRadius,
  padAngle,
  fill,
  color,
  isHovered,
  isFaded,
  animationKey,
  showGlow,
  hoverOffset,
}: AnimatedSliceTranslateProps) {
  const animationDelay = 0.1 + index * 0.08

  const mountSpring = useSpring(0, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  useEffect(() => {
    mountSpring.jump(0)
    const timeout = setTimeout(() => {
      mountSpring.set(1)
    }, animationDelay * 1000)
    return () => clearTimeout(timeout)
  }, [animationDelay, mountSpring])

  const animatedPath = useTransform(mountSpring, (mount) => {
    const currentEndAngle = startAngle + (endAngle - startAngle) * mount
    if (currentEndAngle <= startAngle + 0.01)
      return ''
    return generateArcPath(
      innerRadius,
      outerRadius,
      startAngle,
      currentEndAngle,
      cornerRadius,
      padAngle,
    )
  })

  const offset = getSliceOffset(startAngle, endAngle, hoverOffset)

  return (
    <motion.path
      animate={ {
        opacity: isFaded
          ? 0.4
          : 1,
        x: isHovered
          ? offset.x
          : 0,
        y: isHovered
          ? offset.y
          : 0,
      } }
      d={ animatedPath }
      fill={ fill }
      key={ `slice-${animationKey}-${index}` }
      pointerEvents="none"
      style={ {
        filter: showGlow && isHovered
          ? `drop-shadow(0 0 12px ${color})`
          : 'none',
      } }
      transition={ {
        opacity: { duration: 0.15 },
        x: { type: 'spring', stiffness: 400, damping: 25 },
        y: { type: 'spring', stiffness: 400, damping: 25 },
      } }
    />
  )
}

interface AnimatedSliceGrowProps {
  index: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  cornerRadius: number
  padAngle: number
  fill: string
  color: string
  isHovered: boolean
  isFaded: boolean
  animationKey: number
  showGlow: boolean
  hoverOffset: number
}

function AnimatedSliceGrow({
  index,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  cornerRadius,
  padAngle,
  fill,
  color,
  isHovered,
  isFaded,
  animationKey,
  showGlow,
  hoverOffset,
}: AnimatedSliceGrowProps) {
  const animationDelay = 0.1 + index * 0.08

  const mountSpring = useSpring(0, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  const growSpring = useSpring(outerRadius, {
    stiffness: 400,
    damping: 25,
  })

  useEffect(() => {
    mountSpring.jump(0)
    const timeout = setTimeout(() => {
      mountSpring.set(1)
    }, animationDelay * 1000)
    return () => clearTimeout(timeout)
  }, [animationDelay, mountSpring])

  useEffect(() => {
    growSpring.set(isHovered
      ? outerRadius + hoverOffset
      : outerRadius)
  }, [isHovered, hoverOffset, outerRadius, growSpring])

  const animatedPath = useTransform(
    [mountSpring, growSpring],
    ([mount, currentOuterRadius]) => {
      const currentEndAngle
        = startAngle + (endAngle - startAngle) * (mount as number)
      if (currentEndAngle <= startAngle + 0.01)
        return ''
      return generateArcPath(
        innerRadius,
        currentOuterRadius as number,
        startAngle,
        currentEndAngle,
        cornerRadius,
        padAngle,
      )
    },
  )

  return (
    <motion.path
      animate={ {
        opacity: isFaded
          ? 0.4
          : 1,
      } }
      d={ animatedPath }
      fill={ fill }
      key={ `slice-${animationKey}-${index}` }
      pointerEvents="none"
      style={ {
        filter: showGlow && isHovered
          ? `drop-shadow(0 0 12px ${color})`
          : 'none',
      } }
      transition={ {
        opacity: { duration: 0.15 },
      } }
    />
  )
}

function PieSliceInner({
  index,
  color: colorProp,
  fill: fillProp,
  animate = true,
  showGlow = true,
  hoverEffect = 'translate',
  hoverOffset: hoverOffsetProp,
}: PieSliceProps) {
  const {
    arcs,
    innerRadius,
    outerRadius,
    cornerRadius,
    hoverOffset: contextHoverOffset,
    hoveredIndex,
    setHoveredIndex,
    setTooltipClientPoint,
    animationKey,
    getColor,
    getFill,
  } = usePie()

  const hoverOffset = hoverOffsetProp ?? contextHoverOffset
  const hasAnimated = useRef(false)
  const sliceExpandDelay = index * 0.08

  useEffect(() => {
    if (animate && !hasAnimated.current) {
      const timeout = setTimeout(() => {
        hasAnimated.current = true
      }, (sliceExpandDelay + 0.5) * 1000)
      return () => clearTimeout(timeout)
    }
  }, [animate, sliceExpandDelay])

  const arcData = arcs[index]
  if (!arcData)
    return null

  const color = colorProp || getColor(index)
  const fill = fillProp || getFill(index)
  const isHovered = hoveredIndex === index
  const isFaded = hoveredIndex !== null && hoveredIndex !== index

  const offset = getSliceOffset(
    arcData.startAngle,
    arcData.endAngle,
    hoverOffset,
  )

  const hitboxPath = generateArcPath(
    innerRadius,
    outerRadius,
    arcData.startAngle,
    arcData.endAngle,
    cornerRadius,
    arcData.padAngle,
  )

  const grownOuterRadius = isHovered
    ? outerRadius + hoverOffset
    : outerRadius
  const grownPath = generateArcPath(
    innerRadius,
    grownOuterRadius,
    arcData.startAngle,
    arcData.endAngle,
    cornerRadius,
    arcData.padAngle,
  )

  const renderAnimatedSlice = () => {
    if (hoverEffect === 'grow') {
      return (
        <AnimatedSliceGrow
          animationKey={ animationKey }
          color={ color }
          cornerRadius={ cornerRadius }
          endAngle={ arcData.endAngle }
          fill={ fill }
          hoverOffset={ hoverOffset }
          index={ index }
          innerRadius={ innerRadius }
          isFaded={ isFaded }
          isHovered={ isHovered }
          outerRadius={ outerRadius }
          padAngle={ arcData.padAngle }
          showGlow={ showGlow }
          startAngle={ arcData.startAngle }
        />
      )
    }

    return (
      <AnimatedSliceTranslate
        animationKey={ animationKey }
        color={ color }
        cornerRadius={ cornerRadius }
        endAngle={ arcData.endAngle }
        fill={ fill }
        hoverOffset={ hoverEffect === 'none'
          ? 0
          : hoverOffset }
        index={ index }
        innerRadius={ innerRadius }
        isFaded={ isFaded }
        isHovered={ isHovered }
        outerRadius={ outerRadius }
        padAngle={ arcData.padAngle }
        showGlow={ showGlow }
        startAngle={ arcData.startAngle }
      />
    )
  }

  const renderStaticSlice = () => {
    if (hoverEffect === 'grow') {
      return (
        <motion.path
          animate={ {
            opacity: isFaded
              ? 0.4
              : 1,
            d: grownPath,
          } }
          d={ hitboxPath }
          fill={ fill }
          pointerEvents="none"
          style={ {
            filter: showGlow && isHovered
              ? `drop-shadow(0 0 12px ${color})`
              : 'none',
          } }
          transition={ {
            opacity: { duration: 0.15 },
            d: { type: 'spring', stiffness: 400, damping: 25 },
          } }
        />
      )
    }

    const shouldTranslate = hoverEffect !== 'none' && isHovered
    const translateX = shouldTranslate
      ? offset.x
      : 0
    const translateY = shouldTranslate
      ? offset.y
      : 0

    return (
      <motion.path
        animate={ {
          opacity: isFaded
            ? 0.4
            : 1,
          x: translateX,
          y: translateY,
        } }
        d={ hitboxPath }
        fill={ fill }
        pointerEvents="none"
        style={ {
          filter: showGlow && isHovered
            ? `drop-shadow(0 0 12px ${color})`
            : 'none',
        } }
        transition={ {
          opacity: { duration: 0.15 },
          x: { type: 'spring', stiffness: 400, damping: 25 },
          y: { type: 'spring', stiffness: 400, damping: 25 },
        } }
      />
    )
  }

  return (
    <g style={ { cursor: 'pointer' } }>
      <path
        d={ hitboxPath }
        fill="transparent"
        onMouseEnter={ (e) => {
          setHoveredIndex(index)
          setTooltipClientPoint(e.clientX, e.clientY)
        } }
        onMouseLeave={ () => setHoveredIndex(null) }
        onMouseMove={ (e) => {
          setTooltipClientPoint(e.clientX, e.clientY)
        } }
      />
      { animate
        ? renderAnimatedSlice()
        : renderStaticSlice() }
    </g>
  )
}

export const PieSlice = memo(PieSliceInner)

PieSlice.displayName = 'PieSlice'
