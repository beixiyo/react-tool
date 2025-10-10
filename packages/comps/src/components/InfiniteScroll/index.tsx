'use client'

import type { CSSProperties } from 'react'
import { rafThrottle } from '@jl-org/tool'
import { onMounted, useMemoFn } from 'hooks'
import { memo } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

export const InfiniteScroll = memo<InfiniteScrollProps>((
  {
    style,
    className,
    contentStyle,
    contentClassName,

    loadMore,
    immediate = true,
    hasMore,
    showLoading,
    children,
  },
) => {
  const [isLoading, setIsLoading] = useState(false)

  const isFirst = useRef(true)
  const refScroller = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  /***************************************************
   *                    Fns
   ***************************************************/
  const getSize = useMemoFn((precision = 0) => {
    if (!refScroller.current || !contentRef.current) {
      return {
        top: 0,
        parentHeight: 0,
        contentHeight: 0,
        isFull: false,
      }
    }

    const top = refScroller.current.scrollTop
    const parentHeight = refScroller.current.offsetHeight
    const contentHeight = contentRef.current.offsetHeight - precision

    return {
      top,
      parentHeight,
      contentHeight,
      isFull: top + contentHeight >= parentHeight,
    }
  })

  const onScroll = rafThrottle(() => {
    if (
      hasMore
      && !isLoading
    ) {
      setIsLoading(true)

      loadMore().finally(() => {
        isFirst.current = false
        setIsLoading(false)
      })
    }
  })

  /***************************************************
   *                    Effects
   ***************************************************/
  useEffect(() => {
    if (
      !refScroller.current
      || !contentRef.current
      || !hasMore
      || isFirst.current
    ) {
      return
    }

    const { isFull } = getSize()
    if (!isFull) {
      loadMore()
    }
  })

  onMounted(() => {
    immediate && onScroll()
  })

  return (
    <div
      className={ cn(
        'overflow-auto relative scrollerContainer h-full',
        className,
      ) }
      style={ style }
      ref={ refScroller }
      onScroll={ onScroll }
    >

      <div
        ref={ contentRef }
        style={ contentStyle }
        className={ cn(
          'relative contentContainer',
          contentClassName,
        ) }
      >
        { children }

        <div className="absolute bottom-1 left-0 w-full flex items-center justify-center">
          { isLoading && showLoading && <LoadingIcon size={ 30 } /> }
        </div>
      </div>

    </div>
  )
})

InfiniteScroll.displayName = 'InfiniteScroll'

export interface InfiniteScrollProps {
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties

  keyField?: string
  showLoading?: boolean

  loadMore: () => Promise<void>
  immediate?: boolean
  hasMore?: boolean
  children: React.ReactNode
}
