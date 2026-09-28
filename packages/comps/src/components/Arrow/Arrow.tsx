import { memo } from 'react'
import { cn } from 'utils'
import type { ArrowProps } from './types'

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

  return (
    <div
      className={ cn(className) }
      style={ {
        borderStyle: 'solid',
        borderWidth: `${thickness}px`,
        borderLeftColor: color,
        borderTopColor: color,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',

        transform: `rotate(${finalRotate + 135}deg)`,
        transformOrigin: 'center center',
        width: size,
        height: size,
        ...style,
      } }
    >
    </div>
  )
})
Arrow.displayName = 'Arrow'
