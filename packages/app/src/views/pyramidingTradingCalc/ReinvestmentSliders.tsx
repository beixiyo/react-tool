import React from 'react'

interface ReinvestmentSlidersProps {
  /** 接收一个由5个数字组成的序列数组 */
  sequence: number[]
  /** 当序列发生变化时，通过此回调函数通知父组件 */
  onChange: (newSequence: number[]) => void
}

/**
 * 盈利再投资序列的可视化滑块编辑器组件。
 * @param {ReinvestmentSlidersProps} props
 */
export const ReinvestmentSliders: React.FC<ReinvestmentSlidersProps> = ({ sequence, onChange }) => {
  const handleSliderChange = (index: number, value: number) => {
    const newSequence = [...sequence]
    newSequence[index] = value

    /**
     * 智能约束：强制执行“阶梯下降”规则
     * 当调整一个滑块时，其后的滑块不能比当前滑块的值更高
     */
    for (let i = index + 1; i < newSequence.length; i++) {
      if (newSequence[i] > newSequence[index]) {
        newSequence[i] = newSequence[index]
      }
    }

    /** 同样，其前的滑块不能比当前滑块的值更低 */
    for (let i = index - 1; i >= 0; i--) {
      if (newSequence[i] < newSequence[index]) {
        newSequence[i] = newSequence[index]
      }
    }

    onChange(newSequence)
  }

  return (
    <div className="space-y-4">
      {sequence.map((value, index) => (
        <div key={ index }>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <label>
              第
              {index + 2}
              {' '}
              次加仓 (%):
            </label>
            <span className="rounded-sm bg-gray-900/50 px-2 py-0.5 font-mono">
              {value.toFixed(1)}
              %
            </span>
          </div>
          <input
            type="range"
            min="10" // 最小再投资比例
            max="80" // 最大再投资比例
            step="0.1"
            value={ value }
            onChange={ e => handleSliderChange(index, Number.parseFloat(e.target.value)) }
            /** 使用 accent-color 可以轻松定义滑块和轨道的颜色 */
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600 accent-blue-500"
          />
        </div>
      ))}
    </div>
  )
}
