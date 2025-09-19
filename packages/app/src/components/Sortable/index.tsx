import { cn } from '@/utils'
import { Reorder } from 'framer-motion'
import React from 'react'
import { SortableItem } from './Item'

export interface ItemType {
  id: string
}

interface SortableProps<T extends ItemType> {
  items: T[]
  setItems: (items: T[]) => void
  className?: string | string[]
  itemClassName?: string | string[]
  children: (item: T) => React.ReactNode
}

export function Sortable<T extends ItemType>(
  {
    items,
    setItems,
    className,
    itemClassName,
    children,
  }: SortableProps<T>,
) {
  return (
    <Reorder.Group
      axis="y" // 或者 "x"
      values={ items.map(item => item.id) } // Reorder.Group 需要一个 ID 数组
      onReorder={ (newOrderIds) => {
        /** 根据 newOrderIds 重新排序原始 items 数组 */
        const newItems = newOrderIds.map(id => items.find(item => item.id === id)).filter(Boolean) as T[]
        setItems(newItems)
      } }
      className={ cn(className) }
      layoutScroll
    >
      { items.map(item => (
        <SortableItem key={ item.id } id={ item.id } className={ cn(itemClassName) }>
          { children(item) }
        </SortableItem>
      )) }
    </Reorder.Group>
  )
}

Sortable.displayName = 'SortableList'
