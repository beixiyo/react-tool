import { useTheme } from '@/hooks'
import { cn } from '@/utils'
import { memo } from 'react'

export const GridBg = memo<GridBgProps>((
  {
    style,
    className,
    theme,
  },
) => {
  const curTheme = useTheme()[0]
  const isDark = (theme || curTheme) === 'dark'

  const lightClass = `
  bg-white
  bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)]  bg-[size:2rem_2rem]
  `
  const darkClass = `
    bg-black
    bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:2rem_2rem]
  `

  return <div
    className={ cn(
      'GridBgContainer',
      'absolute inset-0 -z-10 h-full w-full',
      '[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]',
      isDark
        ? darkClass
        : lightClass,
      className,
    ) }
    style={ style }
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
