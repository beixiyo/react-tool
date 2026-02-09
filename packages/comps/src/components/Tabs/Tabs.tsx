'use client'

/**
 * Tabs 组件入口
 */
import type { TabItemType, TabsProps } from './types'
import { memo, useCallback, useId, useMemo } from 'react'
import { cn } from 'utils'
import { MoreTabs } from './MoreTabs'
import { TabHeader } from './TabHeader'
import { TabsContent } from './TabsContent'

function InnerTabs<T extends string>(
  {
    style,
    className,
    headerClass,
    headerWrapClass,
    headerStyle,
    itemClass,
    activeClassName,
    inactiveClassName,
    colors,
    headerAfter,
    tabHeight = 56,
    items,
    activeKey,
    onChange,
    keepAlive = true,
    duration = 0.4,
    dataId,
    maxVisibleTabs,
  }: TabsProps<T>,
) {
  const headerId = useId()
  const isActive = useCallback(
    (item: TabItemType<T>) => item.active || activeKey === item.value,
    [activeKey],
  )
  const handleChange = useCallback(
    (item: TabItemType<T>) => {
      onChange?.(item)
    },
    [onChange],
  )

  const visibleItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(0, maxVisibleTabs)
    : items

  const dropdownItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(maxVisibleTabs)
    : []

  const activeItemInDropdown = dropdownItems.some(item => isActive(item))
  const contentItems = useMemo(
    () => items.map(item => ({
      value: item.value,
      children: item.children,
    })),
    [items],
  )

  return (
    <div
      className={ cn(
        'w-full flex flex-col',
        className,
      ) }
      style={ style }
    >
      <div
        className={ cn('flex w-full items-center border-b border-border', headerWrapClass) }
        style={ {
          height: tabHeight,
          ...headerStyle,
        } }
      >
        { visibleItems.map(item => (
          <TabHeader
            headerId={ headerId }
            key={ item.value }
            onClick={ () => handleChange(item) }
            item={ item }
            active={ isActive(item) }
            className={ headerClass }
            dataId={ dataId }
            activeClassName={ activeClassName }
            inactiveClassName={ inactiveClassName }
            colors={ colors }
          />
        )) }

        { dropdownItems.length > 0 && (
          <MoreTabs<T>
            items={ dropdownItems }
            onChange={ handleChange }
            active={ activeItemInDropdown }
            headerId={ headerId }
            headerClass={ headerClass }
            activeClassName={ activeClassName }
            inactiveClassName={ inactiveClassName }
            colors={ colors }
          />
        ) }

        { headerAfter }
      </div>

      <TabsContent
        items={ contentItems }
        activeValue={ activeKey }
        keepAlive={ keepAlive }
        duration={ duration }
        className="w-full min-h-0"
        style={ {
          height: `calc(100% - ${tabHeight}px)`,
        } }
        itemClassName={ cn('w-full grow', itemClass) }
      />
    </div>
  )
}

export const Tabs = memo(InnerTabs)
Tabs.displayName = 'Tabs'
