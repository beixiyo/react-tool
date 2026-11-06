import type { CSSProperties, ReactNode } from 'react'
import { memo } from 'react'

/** 面板宽度只由布局状态驱动，避免 CSS flex/min-width 产生另一套尺寸预算 */
export const PanelInternal = memo(({
  id,
  children,
  width,
  collapsed,
  isDragging,
  animationDuration,
  className = '',
  allowOverflow,
  marginLeft,
  marginRight,
}: PanelInternalProps) => {
  const duration = isDragging
    ? 0
    : animationDuration
  const baseStyle: CSSProperties = {
    flexShrink: 0,
    flexGrow: 0,
    width,
    minWidth: 0,
    opacity: collapsed
      ? 0.5
      : 1,
    marginLeft: collapsed
      ? 0
      : marginLeft,
    marginRight: collapsed
      ? 0
      : marginRight,
    transition: `width ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out, margin ${duration}ms ease-in-out`,
  }

  return (
    <div
      id={ id }
      className={ `relative ${
        allowOverflow && !collapsed
          ? 'overflow-visible'
          : 'overflow-hidden'
      } ${className}` }
      style={ baseStyle }
    >
      <div
        className="h-full w-full"
        inert={ collapsed }
        aria-hidden={ collapsed }
        style={ {
          visibility: collapsed && width === 0
            ? 'hidden'
            : 'visible',
          // 收起内容随宽度动画一起退出；语义和焦点则立即停用
          transition: `visibility 0s linear ${
            collapsed
              ? duration
              : 0
          }ms`,
        } }
      >
        { children }
      </div>
    </div>
  )
})

type PanelInternalProps = {
  id: string
  children: ReactNode
  width: number
  collapsed: boolean
  isDragging: boolean
  animationDuration: number
  className?: string
  allowOverflow?: boolean
  marginLeft?: number
  marginRight?: number
}
