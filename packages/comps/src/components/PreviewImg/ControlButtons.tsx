'use client'

import { RefreshCw, RotateCw } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export interface ControlButtonsProps {
  /**
   * 旋转按钮点击回调
   */
  onRotate: (e: React.MouseEvent) => void
  /**
   * 重置按钮点击回调
   */
  onReset: (e: React.MouseEvent) => void
}

/**
 * 控制按钮组件
 * 提供旋转和重置功能
 */
export const ControlButtons = memo<ControlButtonsProps>(({
  onRotate,
  onReset,
}) => {
  return (
    <div className="fixed bottom-2 left-1/2 flex items-center gap-2 -translate-x-1/2 z-[60] pointer-events-auto">
      <button
        onClick={ onRotate }
        className={ cn(
          'bg-black/55 dark:bg-white/55 flex justify-center items-center size-7 rounded-full',
          'cursor-pointer hover:bg-black/70 dark:hover:bg-white/70 transition-all duration-300',
          'text-white dark:text-black shadow-lg',
        ) }
        aria-label="旋转图片"
      >
        <RotateCw size={ 15 } strokeWidth={ 1.5 } />
      </button>
      <button
        onClick={ onReset }
        className={ cn(
          'bg-black/55 dark:bg-white/55 flex justify-center items-center size-7 rounded-full',
          'cursor-pointer hover:bg-black/70 dark:hover:bg-white/70 transition-all duration-300',
          'text-white dark:text-black shadow-lg',
        ) }
        aria-label="重置图片"
      >
        <RefreshCw size={ 15 } strokeWidth={ 1.5 } />
      </button>
    </div>
  )
})

ControlButtons.displayName = 'ControlButtons'
