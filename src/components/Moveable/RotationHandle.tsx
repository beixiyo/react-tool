import { RotateCw } from 'lucide-react'
import { memo } from 'react'

interface RotationHandleProps {
  onMouseDown: (e: React.MouseEvent) => void
  style?: React.CSSProperties
  color?: string
}

export const RotationHandle = memo(({ onMouseDown, style, color = '#3b82f6' }: RotationHandleProps) => {
  return (
    <div
      className="moveable-rotation-handle absolute left-1/2 top-0 cursor-pointer -translate-x-1/2 -translate-y-6"
      onMouseDown={ onMouseDown }
      style={ style }
    >
      <RotateCw className="size-4" style={ { color } } />
    </div>
  )
})

RotationHandle.displayName = 'RotationHandle'
