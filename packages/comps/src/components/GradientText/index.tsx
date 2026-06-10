import { memo } from 'react'
import { cn } from 'utils'
import styles from './styles.module.scss'

export const GradientText = memo<GradientTextProps>((
  {
    children,
    className = '',
    style = {},

    colors = ['#ffaa40', '#9c40ff', '#ffaa40'],
    animationDuration = '8s',
    backgroundSize,
    seamlessLoop = true,

    showBorder = false,
    showAnimate = true,
  },
) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration,
  }

  /** seamlessLoop：渐变从左到右单向「转一圈」无缝循环；否则默认来回摆动 */
  const resolvedBackgroundSize = backgroundSize ?? (seamlessLoop
    ? '200% 100%'
    : '300% 100%')
  const animateClass = seamlessLoop
    ? styles.animateGradientLoop
    : styles.animateGradient

  return (
    <div
      className={ cn(
        'relative mx-auto flex max-w-fit flex-row items-center justify-center font-medium backdrop-blur-xs transition-shadow duration-500 overflow-hidden',
        className,
      ) }
      style={ {
        ...style,
      } }
    >
      { showBorder && (
        <div
          className={ cn(
            'pointer-events-none absolute inset-0 z-0 bg-cover',
            showAnimate && animateClass,
          ) }
          style={ {
            ...gradientStyle,
            backgroundSize: resolvedBackgroundSize,
          } }
        >
          <div
            className="absolute inset-0 z-[-1] rounded-[1.25rem] bg-black"
            style={ {
              width: 'calc(100% - 2px)',
              height: 'calc(100% - 2px)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            } }
          ></div>
        </div>
      ) }
      <div
        className={ cn(
          'relative z-2 inline-block bg-cover text-transparent',
          showAnimate && animateClass,
        ) }
        style={ {
          ...gradientStyle,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundSize: resolvedBackgroundSize,
        } }
      >
        { children }
      </div>
    </div>
  )
})

export interface GradientTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties

  colors?: string[]
  animationDuration?: string
  /**
   * 渐变背景尺寸；不传时按是否 `seamlessLoop` 取默认（来回 `'300% 100%'` / 转圈 `'200% 100%'`）
   */
  backgroundSize?: string
  /**
   * 单向无缝循环动画：渐变从左到右「转一圈」，首尾同色（如 `['#a','#b','#a']`）时无缝衔接。
   * 关闭时为默认的来回摆动动画
   * @default false
   */
  seamlessLoop?: boolean

  showBorder?: boolean
  showAnimate?: boolean
}
