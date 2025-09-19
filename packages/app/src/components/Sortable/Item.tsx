import { cn } from '@/utils'
import { Reorder, useMotionValue } from 'framer-motion'
import React from 'react'

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
}

export const SortableItem: React.FC<SortableItemProps> = React.memo(({ id, children, className }) => {
  const y = useMotionValue(0)

  return (
    <Reorder.Item
      value={ id }
      id={ id }
      style={ { y } } // y 属性用于拖动时的平滑动画
      className={ cn(
        className,
      ) }
      whileDrag={ {
        scale: 1.05,
        boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
        zIndex: 50,
      } }
      transition={ { duration: 0.25 } } // 拖动时的动画效果
    >
      { children }
    </Reorder.Item>
  )
})

SortableItem.displayName = 'SortableItem'
