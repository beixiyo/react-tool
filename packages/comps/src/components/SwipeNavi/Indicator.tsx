import { genArr } from '@jl-org/tool'
import { memo } from 'react'
import { cn } from 'utils'

export const Indicator = memo<IndicatorProps>((props) => {
  const {
    style,
    className,
    activeIndex,
    length,
    dotClassName,
    onChange,
  } = props
  const arr = genArr(length, i => i)

  return <div
    className={ cn(
      'IndicatorContainer',
      'absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-2 bg-black/20 rounded-full backdrop-blur-sm',
      className,
    ) }
    style={ style }
  >

    { arr.map(index => (
      <div
        key={ index }
        onClick={ () => onChange?.(index) }
        className={ cn(
          'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/80',
          dotClassName,
          index === activeIndex
            ? 'bg-white w-4'
            : 'bg-white/50',
        ) }
      />
    )) }
  </div>
})

Indicator.displayName = 'Indicator'

export type IndicatorProps = {
  activeIndex: number
  length: number
  dotClassName?: string
  /**
   * 当点击指示器时触发的回调
   */
  onChange?: (index: number) => void
}
& Omit<React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>, 'onChange'>
