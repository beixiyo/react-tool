import { colorAddOpacity } from '@jl-org/tool'
import { motion } from 'motion/react'
import { cn } from 'utils'

const FloatingPaths = memo<FloatingPathsProps>((
  {
    position,
    color = 'rgb(15, 23, 42)',
    className,
  },
) => {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: colorAddOpacity(color, 0.1 + i * 0.03),
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className={ cn(
          'h-full w-full',
          className,
        ) }
        viewBox="0 0 696 316"
        fill="none">
        { paths.map(path => (
          <motion.path
            key={ path.id }
            d={ path.d }
            stroke="currentColor"
            strokeWidth={ path.width }
            strokeOpacity={ 0.1 + path.id * 0.03 }
            initial={ { pathLength: 0.3, opacity: 0.6 } }
            animate={ {
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            } }
            transition={ {
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            } }
          />
        )) }
      </svg>
    </div>
  )
})

export const BgPaths = memo<BgPathsProps>((
  {
    className,
    svgClassName = 'text-slate-950 dark:text-white',
    style,
    children,
  },
) => {
  return (
    <div
      className={ cn(
        'relative min-h-screen w-full flex items-center justify-center overflow-hidden',
        className,
      ) }
      style={ style }
    >
      <div className="absolute inset-0">
        <FloatingPaths className={ svgClassName } position={ 1 } />
        <FloatingPaths className={ svgClassName } position={ -1 } />
      </div>

      <div className="relative z-10 mx-auto px-4 text-center container md:px-6">
        { children }
      </div>
    </div>
  )
})

export type BgPathsProps = {
  className?: string
  svgClassName?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

type FloatingPathsProps = {
  position: number
  color?: string
  className?: string
}
