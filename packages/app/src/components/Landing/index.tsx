import { DyBgc, GridBg } from 'comps'
import { memo } from 'react'
import { Sparkles } from './sparkles'

export const Landing = memo<LandingProps>((
  {
    style,
    className,
    children,
  },
) => {
  return <DyBgc
    containerClassName="LandingContainer relative bg-black min-h-screen"
    className={ className }
    style={ style }
    colors={ [
      ['#0f5f69', '#E2D1FE00'],
      ['#1d5c90ba', '#EFB60901'],
      ['#000', '#1D9BF000'],
      ['#000', '#AA8EF500'],
      ['#000', '#3096A300'],
    ] }
  >
    <div className="absolute inset-0 h-full w-full -z-1">
      <Sparkles />
      <GridBg />
    </div>

    { children }
  </DyBgc>
})

Landing.displayName = 'Landing'

export type LandingProps = {

}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
