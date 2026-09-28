import { cn } from 'utils'

export const Item = memo(({ order, style }: ItemProps) => {
  return (
    <div
      style={ style }
      className={ cn(
        'w-24 h-24 rounded-lg',
        {
          'bg-linear-to-b from-[#3e90f7] to-[#246bf6]': order % 3 === 0,
          'bg-linear-to-b from-[#53b655] to-[#469c50]': order % 3 === 1,
          'bg-linear-to-b from-[#f3a93c] to-[#f4ad3d]': order % 3 === 2,
        },
      ) }
    />
  )
})

export interface ItemProps {
  order: number
  style: React.CSSProperties
}
