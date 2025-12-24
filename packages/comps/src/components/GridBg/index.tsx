import { memo } from 'react'
import { cn } from 'utils'

export const GridBg = memo<GridBgProps>((
  {
    style,
    className,
  },
) => {
  const gridBgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, rgb(var(--border) / 1) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--border) / 1) 1px, transparent 1px)`,
    backgroundSize: '2rem 2rem',
    maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 110%)',
    WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 110%)',
    ...style,
  }

  return <div
    className={ cn(
      'GridBgContainer',
      'absolute inset-0 z-0 h-full w-full',
      className,
    ) }
    style={ gridBgStyle }
  >

  </div>
})

GridBg.displayName = 'GridBg'

export type GridBgProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  theme?: 'dark' | 'light'
}
