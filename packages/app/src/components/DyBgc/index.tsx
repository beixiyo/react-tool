'use client'

import { cn } from 'utils'
import './dyBgc.css'

export const DyBgc = memo<DynamicBackgroundProps>(({
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

  /***************************************************
   *                    styles
   ***************************************************/
  const startBackgroundSize: Value[] = [[1.3, 1.3], [0.8, 0.8], [0.9, 0.9], [1.1, 1.1], [0.9, 0.9]]
  const startBackgroundPosition: Value[] = [[-0.8, -0.8], [0.6, -0.3], [0.1, 0.1], [-0.3, -0.1], [0.5, 0.5]]

  const backgroundSize = startBackgroundSize
    .map(([start, end]) => `${start * maxSize}px ${end * maxSize}px`)
    .join(', ')
  const backgroundPosition = startBackgroundPosition
    .map(([start, end]) => `${start * maxSize}px ${end * maxSize}px`)
    .join(', ')

  /***************************************************
   *                    keyframes
   ***************************************************/
  const sizes: Size = {
    0: startBackgroundSize,
    25: [[1.0, 1.0], [0.9, 0.9], [1.0, 1.0], [0.9, 0.9], [0.6, 0.6]],
    50: [[0.8, 0.8], [1.1, 1.1], [0.8, 0.8], [0.6, 0.6], [0.8, 0.8]],
    75: [[0.9, 0.9], [0.9, 0.9], [1.0, 1.0], [0.9, 0.9], [0.7, 0.7]],
  }

  const positions: Size = {
    0: startBackgroundPosition,
    25: [[-0.6, -0.9], [0.5, -0.4], [0.0, -0.2], [-0.4, -0.2], [0.4, 0.6]],
    50: [[-0.5, -0.7], [0.4, -0.3], [0.1, 0.0], [0.2, 0.1], [0.3, 0.7]],
    75: [[-0.5, -0.4], [0.5, -0.3], [0.2, 0.0], [-0.1, 0.1], [0.4, 0.6]],
  }

  const getBackgroundStyles = (target: Size, percent: keyof Size) => {
    return target[percent]
      .map(([start, end]) => `${start * maxSize}px ${end * maxSize}px`)
      .join(', ')
  }

  const cssVarStyle = {
    '--size0': getBackgroundStyles(sizes, 0),
    '--size25': getBackgroundStyles(sizes, 25),
    '--size50': getBackgroundStyles(sizes, 50),
    '--size75': getBackgroundStyles(sizes, 75),

    '--pos0': getBackgroundStyles(positions, 0),
    '--pos25': getBackgroundStyles(positions, 25),
    '--pos50': getBackgroundStyles(positions, 50),
    '--pos75': getBackgroundStyles(positions, 75),
  } as React.CSSProperties

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
          backgroundImage: colors.map(([start, end]) =>
            `radial-gradient(closest-side, ${start}, ${end})`,
          ).join(', '),
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

type DynamicBackgroundProps = {
  children?: React.ReactNode
  colors?: ColorValue[]
  blurAmount?: number
  animationDuration?: number
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
