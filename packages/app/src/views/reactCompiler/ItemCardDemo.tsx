/**
 * 复杂计算自动优化演示
 * 展示 React Compiler 如何自动为计算结果添加 useMemo
 */

import type { Item } from './types'
import { getColor } from '@jl-org/tool'
import { useState } from 'react'

/**
 * 这个组件会被编译器自动优化
 * 当父组件状态改变时，如果计算结果没有变化，这个组件不会重新渲染
 */
function OptimizedItemCard({ item, total }: { item: Item, total: number }) {
  const bgColor = getColor()

  return (
    <div
      className="p-3 rounded border border-border3 transition-colors duration-200 toning-green"
      style={ { backgroundColor: bgColor } }
    >
      <div className="font-medium text-text">{item.label}</div>
      <div className="text-sm text-text2">
        值:
        {item.value}
      </div>
      <div className="text-xs text-textDisabled">
        总和:
        {total}
      </div>
    </div>
  )
}

/**
 * 演示组件：点击按钮时，只有相关的 ItemCard 会重新渲染
 */
export function ItemCardDemo() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', value: 10, label: '项目 1' },
    { id: '2', value: 20, label: '项目 2' },
    { id: '3', value: 30, label: '项目 3' },
  ])
  const [unrelatedState, setUnrelatedState] = useState(0)

  /** 这个计算会被编译器自动优化 */
  const total = items.reduce((sum, item) => sum + item.value, 0)

  /** 这个函数会被编译器自动优化 */
  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      value: Math.floor(Math.random() * 100),
      label: `项目 ${items.length + 1}`,
    }
    setItems(prev => [...prev, newItem])
  }

  return (
    <div className="p-6 bg-background border border-border3 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-text">示例 2：复杂计算自动优化</h2>
      <p className="text-sm text-text2 mb-4">
        点击"改变无关状态"按钮时，ItemCard 组件不会重新渲染（背景色不变），
        因为它们的 props 没有变化。只有点击"添加项目"时，相关的 ItemCard 才会重新渲染。
      </p>

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <span className="text-lg text-text">
            无关状态:
            {unrelatedState}
          </span>
          <button
            onClick={ () => setUnrelatedState(prev => prev + 1) }
            className="px-4 py-2 bg-danger text-white rounded hover:opacity-80 transition-opacity"
          >
            改变无关状态
          </button>
          <button
            onClick={ handleAddItem }
            className="px-4 py-2 bg-success text-white rounded hover:opacity-80 transition-opacity"
          >
            添加项目
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(item => (
            <OptimizedItemCard key={ item.id } item={ item } total={ total } />
          ))}
        </div>
      </div>
    </div>
  )
}
