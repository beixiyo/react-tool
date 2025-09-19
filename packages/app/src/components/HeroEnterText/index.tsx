import { memo } from 'react'
import { cn } from 'utils'
import styles from './styles.module.scss'

/**
 * 从大到小的进入动画效果，背景图片由近到远的切换
 */
export const HeroEnterText = memo<HeroEnterTextProps>((
  {
    style,
    className,
    children,
    as: Component = 'h1',
    duration = '2s',
    finalFontSize = '12vw',
    initFontSize = '300vw',
    color = '#fff',
    backgroundImage = 'https://images.pexels.com/photos/1147124/pexels-photo-1147124.jpeg?fit=crop&crop=focalpoint&dpr=1',
  },
) => {
  const cssVar = {
    '--duration': duration,
    '--init-font-size': initFontSize,
    '--final-font-size': finalFontSize,
    '--color': color,
    '--backgroundImage': !backgroundImage.startsWith('http')
      ? backgroundImage
      : `url(${backgroundImage})`,
  }

  return <Component
    className={ cn(
      'HeroEnterTextContainer size-full overflow-hidden flex justify-center items-center text-nowrap',
      styles.HeroEnterText,
      className,
    ) }
    style={ {
      ...cssVar,
      ...style,
    } }
  >
    { children }
  </Component>
})

HeroEnterText.displayName = 'HeroEnterText'

export type HeroEnterTextProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  as?: React.ElementType

  /**
   * @default '2s'
   */
  duration?: string
  /**
   * @default '4vw'
   */
  finalFontSize?: string
  /**
   * @default '20vw'
   */
  initFontSize?: string
  /**
   * @default '#fff'
   */
  color?: string
  backgroundImage?: string
}
