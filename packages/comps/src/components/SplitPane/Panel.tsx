import type { CSSProperties, ReactNode } from 'react'
import { memo } from 'react'

export type PanelInternalProps = {
  /**
   * 面板内容
   */
  children: ReactNode
  /**
   * 面板宽度
   */
  width: number
  /**
   * 是否已收起
   */
  collapsed: boolean
  /**
   * 是否是中间面板（自适应宽度）
   */
  isMiddle: boolean
  /**
   * 是否正在拖拽中
   */
  isDragging: boolean
  /**
   * 动画持续时间
   */
  animationDuration: number
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 面板内部渲染组件
 */
export const PanelInternal = memo(({
  children,
  width,
  collapsed,
  isMiddle,
  isDragging,
  animationDuration,
  className = '',
}: PanelInternalProps) => {
  const flexGrow = isMiddle
    ? 1
    : 0
  const flexShrink = isMiddle
    ? 1
    : 0
  const baseStyle: CSSProperties = {
    flexShrink,
    flexGrow,
    width: isMiddle
      ? 'auto'
      : width,
    opacity: collapsed
      ? 0.5
      : 1,
    transition: isDragging
      ? 'none'
      : `width ${animationDuration}ms ease-in-out, opacity ${animationDuration}ms ease-in-out`,
  }

  return (
    <div
      className={ `relative overflow-hidden ${className}` }
      style={ baseStyle }
    >
      <div
        className="h-full w-full"
        style={ {
          visibility: collapsed && width === 0
            ? 'hidden'
            : 'visible',
        } }
      >
        { children }
      </div>
    </div>
  )
})
