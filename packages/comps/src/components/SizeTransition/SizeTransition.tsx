'use client'

import { motion } from 'motion/react'
import { memo } from 'react'
import type { ElementType } from 'react'
import type { SizeTransitionProps, SizeTransitionTag } from './types'

function InnerSizeTransition<Tag extends SizeTransitionTag = 'div'>({
  as,
  open,
  ...rest
}: SizeTransitionProps<Tag>) {
  const Component = motion[as ?? 'div'] as ElementType

  return (
    <Component
      initial={ false }
      animate={ open
        ? 'open'
        : 'closed' }
      exit="closed"
      { ...rest }
    />
  )
}

/** 单节点尺寸过渡；不添加样式、容器或默认尺寸 */
export const SizeTransition = memo(InnerSizeTransition) as typeof InnerSizeTransition
