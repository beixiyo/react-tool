/**
 * Mask 类型声明
 */

import type { MotionProps } from 'motion/react'
import type * as React from 'react'
import type { CSSProperties } from 'react'
export type MaskBgProps =
  & {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode
  }
  & MotionProps
  & React.ComponentPropsWithRef<'div'>
