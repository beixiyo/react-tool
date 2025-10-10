import { cn } from 'utils'
import styles from './styles.module.scss'

export const GradientText = memo<GradientTextProps>((
  {
    children,
    className = '',
    style = {},

    colors = ['#ffaa40', '#9c40ff', '#ffaa40'],
    animationDuration = '8s',
    backgroundSize = '300% 100%',

    showBorder = false,
    showAnimate = true,
  },
) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration,
  }

  return (
    <div
      className={ cn(
        'relative mx-auto flex max-w-fit flex-row items-center justify-center font-medium backdrop-blur-sm transition-shadow duration-500 overflow-hidden',
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
            showAnimate && styles.animateGradient,
          ) }
          style={ {
            ...gradientStyle,
            backgroundSize,
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
          showAnimate && styles.animateGradient,
        ) }
        style={ {
          ...gradientStyle,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundSize,
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
   * @default '300% 100%'
   */
  backgroundSize?: string

  showBorder?: boolean
  showAnimate?: boolean
}
