'use client'

import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'

const FloatingPaths = memo<FloatingPathsProps>((
  {
    position,
    className,
  },
) => {
  /**
   * 一次性生成 paths（含随机动画周期），避免每次渲染重算；
   * 随机 duration 只在挂载时计算一次，规避 SSR/CSR 水合不一致
   */
  const paths = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    duration: 20 + Math.random() * 10,
  })), [position])

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
              duration: path.duration,
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
  /**
   * 外层容器类名。默认容器为整屏 Hero 背景（含 `min-h-screen`），
   * 作为局部区块背景时可通过此项覆盖高度（如传 `h-full`）
   */
  className?: string
  /**
   * SVG 描边颜色类名（通过 `currentColor` 着色）
   * @default 'text-slate-950 dark:text-white'
   */
  svgClassName?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

type FloatingPathsProps = {
  position: number
  className?: string
}
