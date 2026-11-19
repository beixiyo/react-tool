import { memo } from 'react'
import { cn } from 'utils'
import type { GlowBorderProps } from '../types'
import styles from './GlowBorder.module.scss'

export const GlowBorder = memo(({
  className,
  children,
  ref,
  style,
  borderSize = 2,
  surfaceColor,
  gradientColors = ['#f0f', '#0ff', '#ff0'],
  animationDuration = '4s',
  animationMode = 'loop',
  animationAngleRange,
  ...rest
}: GlowBorderProps) => {
  const [startAngle, endAngle] = animationAngleRange ?? [
    0,
    animationMode === 'hover'
      ? 90
      : 360,
  ]
  const angleDelta = endAngle - startAngle
  const colors = gradientColors.length
    ? [...gradientColors, gradientColors[0]].join(', ')
    : 'transparent, transparent'
  const hasBorder = borderSize > 0

  return (
    <div
      { ...rest }
      ref={ ref }
      className={ cn(
        styles.root,
        hasBorder && gradientColors.length > 0 && styles.glowing,
        hasBorder && animationMode === 'loop' && styles.loop,
        hasBorder && animationMode === 'hover' && styles.hover,
        className,
      ) }
      style={ {
        '--glow-border-size': `${Math.max(0, borderSize)}px`,
        '--glow-border-surface': surfaceColor,
        '--glow-border-colors': colors,
        '--glow-border-duration': animationDuration,
        '--glow-border-start': `${startAngle}deg`,
        '--glow-border-delta': `${angleDelta}deg`,
        '--glow-border-direction': angleDelta % 360 === 0
          ? 'normal'
          : 'alternate',
        ...style,
      } as React.CSSProperties }
    >
      { children }
    </div>
  )
})

GlowBorder.displayName = 'GlowBorder'
