import type { TimeFunc } from '@jl-org/cvs'
import { memo } from 'react'
import { cn } from 'utils'

/** 动画曲线选择器 */
export const EasePicker = memo<{
  onSelect: (ease: TimeFunc) => void
  selected: TimeFunc
}>(({
  onSelect,
  selected,
}) => {
  const easingOptions: { name: string, label: string }[] = [
    { name: 'linear', label: '线性' },
    { name: 'ease', label: '默认缓动' },
    { name: 'easeIn', label: '渐入' },
    { name: 'easeOut', label: '渐出' },
    { name: 'easeInOut', label: '渐入渐出' },
    { name: 'backIn', label: '回弹进入' },
    { name: 'backOut', label: '回弹退出' },
    { name: 'elasticIn', label: '弹性进入' },
    { name: 'elasticOut', label: '弹性退出' },
    { name: 'bounceIn', label: '弹跳进入' },
    { name: 'bounceOut', label: '弹跳退出' },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2">
      { easingOptions.map(option => (
        <button
          key={ option.name }
          className={ cn(
            'px-3 py-2 text-sm rounded-md transition-colors',
            selected === option.name
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
          ) }
          onClick={ () => onSelect(option.name as TimeFunc) }
        >
          { option.label }
        </button>
      )) }
    </div>
  )
})
EasePicker.displayName = 'EasePicker'
