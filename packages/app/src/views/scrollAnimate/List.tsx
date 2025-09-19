import { createAnimation } from '@jl-org/tool'
import { onMounted, useBindWinEvent } from 'hooks'
import { cn } from 'utils'
import { Item } from './Item'

export const List = memo<ListProps>(({
  className,
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const size = 100
  const [itemStyles, setItemStyles] = useState<Map<number, React.CSSProperties>>(new Map())

  /**
   * 控制位移顺序
   */
  const orders = [
    0,
    1,
    2,
    3,
    2,
    1,
    0,
    0,
    1,
    2,
    3,
    2,
    1,
    0,
  ]

  const updateAnimations = () => {
    const parentEl = containerRef.current?.parentElement
    if (
      !listRef.current
      || !containerRef.current
      || !parentEl
    ) {
      return
    }

    const parentRect = parentEl.getBoundingClientRect()
    const listRect = listRef.current.getBoundingClientRect()

    const scrollY = Math.abs(parentRect.top)
    const parentTop = parentRect.top + scrollY
    const parentBottom = parentRect.bottom + scrollY - containerRef.current.clientHeight

    const newStyles = new Map<number, React.CSSProperties>()

    orders.forEach((order, index) => {
      const item = listRef.current!.children[index] as HTMLElement
      const scrollStart = parentTop + order * 600
      const scrollEnd = parentBottom

      const itemLeft = item.offsetLeft
      const itemTop = item.offsetTop

      const opacityAnimation = createAnimation(scrollStart, scrollEnd, 0, 1)
      const scaleAnimation = createAnimation(scrollStart, scrollEnd, 0.5, 1)
      const translateXAnimation = createAnimation(
        scrollStart,
        scrollEnd,
        listRect.width / 2 - itemLeft - size / 2,
        0,
      )
      const translateYAnimation = createAnimation(
        scrollStart,
        scrollEnd,
        listRect.height / 2 - itemTop - size / 2,
        0,
      )

      const parentRect = parentEl.getBoundingClientRect()
      const currentScroll = Math.abs(parentRect.top)
      newStyles.set(index, {
        opacity: opacityAnimation(currentScroll),
        transform: `translate(${translateXAnimation(currentScroll)}px, ${translateYAnimation(currentScroll)}px) scale(${scaleAnimation(currentScroll)})`,
      })
    })

    setItemStyles(newStyles)
  }

  onMounted(() => {
    updateAnimations()
  })
  useBindWinEvent('resize', updateAnimations)
  useBindWinEvent('scroll', updateAnimations)

  return <div
    ref={ containerRef }
    className="animation-container sticky top-0 h-screen"
  >
    { children }

    <div
      ref={ listRef }
      className={ cn(
        'absolute left-1/2 top-64 grid grid-cols-7 grid-rows-2',
        'aspect-2/1 w-[80%] place-items-center rounded-lg -translate-x-1/2',
        className,
      ) }
      style={ style }
    >
      { orders.map((order, index) => (
        <Item
          key={ index }
          order={ order }
          style={ {
            ...itemStyles.get(index) || {},
            width: size,
            height: size,
          } }
        />
      )) }
    </div>
  </div>
})

export type ListProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}
