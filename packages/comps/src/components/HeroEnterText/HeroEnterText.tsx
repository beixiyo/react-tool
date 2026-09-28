import { forwardRef, memo, useMemo } from 'react'
import { cn } from 'utils'
import styles from './styles.module.scss'
import type { HeroEnterTextProps } from './types'

/**
 * 从大到小的进入动画效果，背景图片由近到远的切换
 */
const InnerHeroEnterText = forwardRef<HTMLElement, HeroEnterTextProps>((
  {
    style,
    className,
    children,
    as: Component = 'h1',
    duration = '2s',
    finalFontSize = '12vw',
    initFontSize = '300vw',
    color = 'rgb(var(--text) / 1)',
    backgroundImage = 'https://images.pexels.com/photos/1147124/pexels-photo-1147124.jpeg?fit=crop&crop=focalpoint&dpr=1',
    ...rest
  },
  ref,
) => {
  const cssVar = useMemo(() => ({
    '--duration': duration,
    '--init-font-size': initFontSize,
    '--final-font-size': finalFontSize,
    '--color': color,
    '--backgroundImage': !backgroundImage.startsWith('http')
      ? backgroundImage
      : `url(${backgroundImage})`,
  } as React.CSSProperties), [duration, initFontSize, finalFontSize, color, backgroundImage])

  return (
    <Component
      ref={ ref }
      className={ cn(
        'HeroEnterTextContainer size-full overflow-hidden flex justify-center items-center text-nowrap',
        styles.HeroEnterText,
        className,
      ) }
      style={ {
        ...cssVar,
        ...style,
      } }
      { ...rest }
    >
      { children }
    </Component>
  )
})

InnerHeroEnterText.displayName = 'HeroEnterText'

/**
 * 从大到小的进入动画效果，背景图片由近到远的切换
 */
export const HeroEnterText = memo(InnerHeroEnterText)

HeroEnterText.displayName = 'HeroEnterText'
