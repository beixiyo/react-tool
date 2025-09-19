import { memo } from 'react'

interface ControlPointProps {
  position: Dir
  onMouseDown: (e: React.MouseEvent, position: Dir) => void
  style?: React.CSSProperties
  color?: string
}

export type Dir = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'w' | 'e' | ''

const positionStyles = {
  'nw': '-top-1 -left-1 cursor-nw-resize',
  'ne': '-top-1 -right-1 cursor-ne-resize',
  'se': '-bottom-1 -right-1 cursor-se-resize',
  'sw': '-bottom-1 -left-1 cursor-sw-resize',
  'n': '-top-1 left-1/2 -translate-x-1/2 cursor-n-resize',
  's': '-bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize',
  'w': '-left-1 top-1/2 -translate-y-1/2 cursor-w-resize',
  'e': '-right-1 top-1/2 -translate-y-1/2 cursor-e-resize',
  '': '',
}

export const ControlPoint = memo(({ position, onMouseDown, style, color = '#4ADE80' }: ControlPointProps) => {
  return (
    <div
      className={ `moveable-control-point absolute size-3 bg-white rounded-full ${positionStyles[position]}` }
      onMouseDown={ e => onMouseDown(e, position) }
      style={ {
        ...style,
        border: `1px solid ${color}`,
      } }
    />
  )
})

ControlPoint.displayName = 'ControlPoint'
