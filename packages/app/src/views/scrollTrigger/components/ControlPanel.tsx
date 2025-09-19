import type { TimeFunc } from '@jl-org/cvs'
import { memo } from 'react'
import { Slider } from '@/components/Slider'
import { EasePicker } from './EasePicker'

/** 控制面板组件 */
export const ControlPanel = memo<{
  selectedEase: TimeFunc
  startPos: number
  endPos: number
  onEaseChange: (ease: TimeFunc) => void
  onStartPosChange: (value: number) => void
  onEndPosChange: (value: number) => void
}>(({
  selectedEase,
  startPos,
  endPos,
  onEaseChange,
  onStartPosChange,
  onEndPosChange,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="mx-auto container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-medium">动画曲线:</h3>
            <EasePicker
              selected={ selectedEase }
              onSelect={ onEaseChange }
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="w-48 space-y-2">
              <label htmlFor="startPos" className="text-sm font-medium">开始偏移:</label>
              <Slider
                min={ 0 }
                max={ 1000 }
                step={ 50 }
                value={ startPos }
                onChange={ value => onStartPosChange(value as number) }
                tooltip={ {
                  formatter: val => `${val}px`,
                } }
              />
              <span className="text-xs text-gray-500">
                {startPos}
                px
              </span>
            </div>

            <div className="w-48 space-y-2">
              <label htmlFor="endPos" className="text-sm font-medium">结束偏移:</label>
              <Slider
                min={ 100 }
                max={ 1200 }
                step={ 50 }
                value={ endPos }
                onChange={ value => onEndPosChange(value as number) }
                tooltip={ {
                  formatter: val => `${val}px`,
                } }
              />
              <span className="text-xs text-gray-500">
                {endPos}
                px
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
ControlPanel.displayName = 'ControlPanel'
