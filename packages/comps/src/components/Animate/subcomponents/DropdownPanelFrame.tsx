import type { Transition, Variants } from 'motion/react'
import { useIsPresent } from 'motion/react'
import { memo, useLayoutEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { SizeTransition } from '../../SizeTransition'
import type { SizeTransitionProps, SizeTransitionTag } from '../../SizeTransition'
import type { DropdownMotion } from '../types'
import { MOTION_TRANSITIONS } from '../utils/transitions'

const PANEL_TRANSITION = {
  ...MOTION_TRANSITIONS.smooth,
  // 反向时从当前高度继续，不沿用旧速度
  velocity: 0,
  overflow: { duration: 0 },
} satisfies Transition

const INSTANT_TRANSITION = { duration: 0 }

/** 下拉浮层内部适配层，不添加 DOM 或外观 */
function InnerDropdownPanelFrame<Tag extends SizeTransitionTag>({
  open,
  above,
  height,
  style,
  className: defaultClassName,
  motionOptions,
  children,
}: DropdownPanelFrameProps<Tag>) {
  const isPresent = useIsPresent()
  const { top, left, bottom } = style
  const anchor = above && bottom == null && top != null
    ? {
      top: undefined,
      left,
      bottom: `calc(100% - ${
        typeof top === 'number'
          ? `${top}px`
          : top
      } - ${height}px)`,
    }
    : { top, left, bottom }
  const [exitPosition, setExitPosition] = useState(anchor)

  useLayoutEffect(() => {
    if (open) setExitPosition({ top: anchor.top, left: anchor.left, bottom: anchor.bottom })
  }, [open, anchor.top, anchor.left, anchor.bottom])

  const { className = defaultClassName, style: motionStyle, variants, transition, ...rest } = motionOptions || {}
  const defaultVariants = {
    open: { height, opacity: 1, transitionEnd: { overflow: 'visible' } },
    closed: { height: 0, opacity: 0, overflow: 'clip' },
  } satisfies Variants

  // motionOptions 已按 as 校验；TS 无法从 Omit 和泛型余项还原原生属性的交叉类型
  const panelProps = {
    ...rest,
    open,
    className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: above
        ? 'flex-end'
        : undefined,
      pointerEvents: open && isPresent
        ? undefined
        : 'none',
      ...style,
      ...(open
        ? anchor
        : exitPosition),
      ...motionStyle,
    },
    variants: typeof variants === 'function'
      ? variants({ height })
      : variants ?? defaultVariants,
    transition: motionOptions === false
      ? INSTANT_TRANSITION
      : transition ?? PANEL_TRANSITION,
    inert: !open || !isPresent,
    'aria-hidden': !open || !isPresent,
    children,
  } as SizeTransitionProps<Tag>

  return <SizeTransition { ...panelProps } />
}

export const DropdownPanelFrame = memo(InnerDropdownPanelFrame) as typeof InnerDropdownPanelFrame

type DropdownPanelFrameProps<Tag extends SizeTransitionTag> = {
  open: boolean
  above: boolean
  height: number
  style: CSSProperties
  className?: string
  motionOptions?: DropdownMotion<Tag>
  children: ReactNode
}
