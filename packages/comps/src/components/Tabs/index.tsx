'use client'

import type { CSSProperties } from 'react'
import { memo, useCallback, useId } from 'react'
import { cn } from 'utils'
import { MoreTabs } from './MoreTabs'
import { TabHeader } from './TabHeader'
import { TabItem } from './TabItem'

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

    dataId,
    maxVisibleTabs,
  }: TabsProps<T>,
) {
  const headerId = useId()
  const isActive = useCallback(
    (item: TabItemType<T>) => item.active || activeKey === item.value,
    [activeKey],
  )

  const visibleItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(0, maxVisibleTabs)
    : items

  const dropdownItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(maxVisibleTabs)
    : []

  const activeItemInDropdown = dropdownItems.some(item => isActive(item))

  return <div
    className={ cn(
      'w-full flex flex-col',
      className,
    ) }
    style={ style }
  >

    <div
      className={ cn('flex w-full items-center border-b dark:border-gray-700', headerWrapClass) }
      style={ {
        height: tabHeight,
        ...headerStyle,
      } }
    >
      { visibleItems.map(item => (
        <TabHeader
          headerId={ headerId }
          key={ item.value }
          onClick={ () => onChange?.(item) }
          item={ item }
          active={ isActive(item) }
          className={ headerClass }
          dataId={ dataId }
          activeClassName={ activeClassName }
          inactiveClassName={ inactiveClassName }
          colors={ colors }
        />
      ),
      ) }

      { dropdownItems.length > 0 && (
        <MoreTabs<T>
          items={ dropdownItems }
          onChange={ onChange }
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

    { items.map((item, index) => (
      <TabItem
        key={ index }
        item={ item }
        active={ isActive(item) }
        style={ {
          height: `calc(100% - ${tabHeight}px)`,
        } }
        className={ cn('w-full grow', itemClass) }
      />
    ),
    ) }

  </div>
}

export const Tabs = memo(InnerTabs) as typeof InnerTabs
InnerTabs.displayName = 'Tabs'

export interface TabsProps<T extends string> {
  className?: string
  style?: CSSProperties
  headerClass?: string
  itemClass?: string
  headerWrapClass?: string
  headerStyle?: CSSProperties

  headerAfter?: React.ReactNode

  /** 活跃标签的类名 */
  activeClassName?: string
  /** 非活跃标签的类名 */
  inactiveClassName?: string
  /** 底部横条的渐变色数组 */
  colors?: string[]

  tabHeight?: number
  items: TabItemType<T>[]
  activeKey?: T
  onChange?: (item: TabItemType<T>) => void

  dataId?: string

  /**
   * 最大可见标签数，超出部分将显示在下拉菜单中
   * @default undefined
   */
  maxVisibleTabs?: number
}

export interface TabItemType<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode

  /** 指定为激活状态 */
  active?: boolean
  children?: React.ReactNode
  header?: (item: Omit<TabItemType<T>, 'header'>) => React.ReactNode
}
