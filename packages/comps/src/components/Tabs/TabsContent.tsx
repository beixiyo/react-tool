'use client'

/**
 * Tabs 内容区域
 */
import type { TabsContentProps } from './types'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { KeepAlive } from '../KeepAlive'

function InnerTabsContent({
  className,
  style,
  items,
  activeValue,
  keepAlive = true,
  duration = 0.4,
  itemClassName,
  itemStyle,
}: TabsContentProps) {
  const activeIndex = useMemo(() => {
    if (!activeValue)
      return 0
    const index = items.findIndex(item => item.value === activeValue)
    return index === -1 ? 0 : index
  }, [activeValue, items])

  return (
    <div
      className={ cn('relative w-full min-h-0 overflow-hidden', className) }
      style={ style }
    >
      <div
        className="flex w-full h-full transition-transform will-change-transform"
        style={ {
          transform: `translateX(-${activeIndex * 100}%)`,
          transitionDuration: `${duration}s`,
          transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        } }
      >
        { items.map((item) => {
          const isActive = item.value === activeValue
          const content = (
            <div className="w-full h-full">
              { item.children }
            </div>
          )

          return (
            <div
              key={ item.key ?? item.value }
              className={ cn('w-full shrink-0', itemClassName) }
              style={ itemStyle }
              role="tabpanel"
              data-active={ isActive }
              aria-hidden={ !isActive }
            >
              { keepAlive
                ? (
                    <KeepAlive active={ isActive } uniqueKey={ item.value }>
                      { content }
                    </KeepAlive>
                  )
                : content }
            </div>
          )
        }) }
      </div>
    </div>
  )
}

InnerTabsContent.displayName = 'Tabs.Content'

export const TabsContent = memo(InnerTabsContent) as typeof InnerTabsContent
