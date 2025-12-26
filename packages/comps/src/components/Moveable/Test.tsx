'use client'

import type { MoveablePosition } from '.'
import { useState } from 'react'
import { Moveable } from '.'
import { Checkbox } from '../Checkbox/Checkbox'
import { ThemeToggle } from '../ThemeToggle'

function App() {
  const [position, setPosition] = useState<MoveablePosition>({
    x: 100,
    y: 100,
    width: 0,
    height: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  })

  const [controls, setControls] = useState({
    canDrag: true,
    canRotate: true,
    canResize: true,
    showBorder: false,
    color: '#4ADE80',
    canDragOutside: false,
    lockAspectRatio: false,
    disabled: false,
  })

  const handlePositionChange = (x: number, y: number) => {
    setPosition(prev => ({ ...prev, x, y }))
  }

  const handleResize = (width: number, height: number, scaleX: number, scaleY: number) => {
    setPosition(prev => ({ ...prev, width, height, scaleX, scaleY }))
  }

  const handleRotate = (rotation: number) => {
    setPosition(prev => ({ ...prev, rotation }))
  }

  const handleTransformEnd = (finalPosition: MoveablePosition) => {
    setPosition(finalPosition)
    console.log('Transform ended:', finalPosition)
  }

  /** 格式化位置信息 */
  const formattedPosition = {
    x: position.x.toFixed(2),
    y: position.y.toFixed(2),
    width: position.width.toFixed(2),
    height: position.height.toFixed(2),
    rotation: position.rotation.toFixed(2),
    scaleX: position.scaleX.toFixed(2),
    scaleY: position.scaleY.toFixed(2),
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-backgroundSecondary">
      <ThemeToggle></ThemeToggle>
      {/* 右上角位置信息卡片 */ }
      <div className="absolute right-4 top-4 w-64 border border-border rounded-lg bg-background p-4 shadow-card">
        <h2 className="mb-2 text-lg text-textPrimary font-semibold">位置信息</h2>
        <pre className="text-sm text-textSecondary font-mono">
          { JSON.stringify(formattedPosition, null, 2) }
        </pre>
      </div>

      {/* 控制面板 */ }
      <div className="absolute left-4 top-4 w-64 border border-border rounded-lg bg-background p-4 shadow-card">
        <h2 className="mb-4 text-lg text-textPrimary font-semibold">控制面板</h2>
        <div className="space-y-2">
          <Checkbox
            checked={ controls.canDrag }
            onChange={ checked => setControls(prev => ({ ...prev, canDrag: checked })) }
            label="允许拖动"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />
          <Checkbox
            checked={ controls.canRotate }
            onChange={ checked => setControls(prev => ({ ...prev, canRotate: checked })) }
            label="允许旋转"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />
          <Checkbox
            checked={ controls.canResize }
            onChange={ checked => setControls(prev => ({ ...prev, canResize: checked })) }
            label="允许调整大小"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />
          <Checkbox
            checked={ controls.showBorder }
            onChange={ checked => setControls(prev => ({ ...prev, showBorder: checked })) }
            label="显示边框"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />
          <Checkbox
            checked={ controls.canDragOutside }
            onChange={ checked => setControls(prev => ({ ...prev, canDragOutside: checked })) }
            label="允许拖出边界"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />
          <Checkbox
            checked={ controls.lockAspectRatio }
            onChange={ checked => setControls(prev => ({ ...prev, lockAspectRatio: checked })) }
            label="锁定宽高比"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />
          <Checkbox
            checked={ controls.disabled }
            onChange={ checked => setControls(prev => ({ ...prev, disabled: checked })) }
            label="禁用"
            size={ 22 }
            strokeWidth={ 3 }
            color="#f00"
            labelClassName="text-textSecondary hover:text-textPrimary transition-colors"
          />

          { controls.showBorder && (
            <div className="flex items-center gap-2 text-textSecondary">
              <span>主题颜色：</span>
              <input
                type="color"
                value={ controls.color }
                onChange={ e => setControls(prev => ({ ...prev, color: e.target.value })) }
                className="h-6 w-12 cursor-pointer border rounded-sm bg-background"
              />
            </div>
          ) }
        </div>
      </div>

      <Moveable
        initialPosition={ position }
        onPositionChange={ handlePositionChange }
        onResize={ handleResize }
        onRotate={ handleRotate }
        onTransformEnd={ handleTransformEnd }
        minWidth={ 200 }
        minHeight={ 80 }
        maxWidth={ 400 }
        maxHeight={ 400 }
        canDragOutside={ controls.canDragOutside }
        lockAspectRatio={ controls.lockAspectRatio }
        canDrag={ controls.canDrag }
        canRotate={ controls.canRotate }
        canResize={ controls.canResize }
        showBorder={ controls.showBorder }
        color={ controls.color }
        disabled={ controls.disabled }
      >
        <div className="h-32 w-48 flex items-center justify-center border-2 border-systemBlue rounded-lg bg-systemBlue/10 transition-colors">
          <div className="text-center">
            <div className="text-lg text-systemBlue font-semibold">可调整元素</div>
            <div className="mt-1 text-sm text-systemBlue/80">
              尝试拖拽边缘中点控制点
            </div>
          </div>
        </div>
      </Moveable>
    </div>
  )
}

export default App
