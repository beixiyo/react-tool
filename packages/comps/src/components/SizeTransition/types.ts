import type { HTMLElements, HTMLMotionProps } from 'motion/react'
import type { Ref } from 'react'

/** Motion 支持的原生 HTML 标签 */
export type SizeTransitionTag = keyof HTMLElements

/** 渲染单个 Motion 元素；原生属性和 ref 随 as 推导 */
export type SizeTransitionProps<Tag extends SizeTransitionTag = 'div'> = {
  /** 渲染的 HTML 标签。@default 'div' */
  as?: Tag
  /** 未显式提供 animate / exit 时，使用 open / closed 变体 */
  open: boolean
  ref?: Ref<HTMLElements[NoInfer<Tag>]>
} & Omit<HTMLMotionProps<NoInfer<Tag>>, 'as' | 'open' | 'ref'>
