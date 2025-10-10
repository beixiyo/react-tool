import type { CSSProperties } from 'react'
import { memo } from 'react'
import { cn } from 'utils'

export const Arrow = memo((
  {
    style,
    className,

    color = 'black',
    size = 6,
    thickness = 1,
    rotate = 0,
    direction,
  }: ArrowProps,
) => {
  /** 根据方向设置旋转角度 */
  let finalRotate = rotate
  if (direction) {
    switch (direction) {
      case 'up':
        finalRotate = 270
        break
      case 'right':
        finalRotate = 0
        break
      case 'down':
        finalRotate = 90
        break
      case 'left':
        finalRotate = 180
        break
    }
  }

  return <div
    className={ cn(className) }
    style={ {
      borderTop: 'none',
      borderRight: 'none',
      borderStyle: 'solid',
      borderWidth: `${thickness}px`,
      borderLeftColor: color,
      borderTopColor: color,
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',

      transform: `rotate(${finalRotate + 135}deg)`,
      transformOrigin: 'left left',
      width: size,
      height: size,
      transition: '.3s',
      ...style,
    } }
  >
  </div>
})
Arrow.displayName = 'Arrow'

export type ArrowDirection = 'up' | 'right' | 'down' | 'left'

export interface ArrowProps {
  className?: string
  style?: CSSProperties

  color?: string
  size?: number
  thickness?: number
  rotate?: number
  /**
   * 箭头方向，优先级高于rotate属性
   * @default undefined - 使用rotate属性
   */
  direction?: ArrowDirection
}
