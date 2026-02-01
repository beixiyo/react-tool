/**
 * For 组件
 * 渲染 signal 数组，自动缓存列表项
 */
import { getColor } from '@jl-org/tool'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { For } from '@preact/signals-react/utils'
import { Button, Card, Input } from 'comps'
import { memo, useRef } from 'react'

type Item = { id: number, value: string }

const initialId = Date.now()
const items = signal<Item[]>([
  { id: initialId, value: 'A' },
  { id: initialId + 1, value: 'B' },
  { id: initialId + 2, value: 'C' },
])

export const ForComponent = memo(() => {
  useSignals()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  const addItem = () => {
    items.value = [
      ...items.value,
      { id: Date.now(), value: `Item ${items.value.length + 1}` },
    ]
  }

  const removeItem = (id: number) => {
    items.value = items.value.filter(item => item.id !== id)
  }

  const updateItem = (id: number, value: string) => {
    items.value = items.value.map(item =>
      item.id === id ? { ...item, value } : item,
    )
  }

  return (
    <Card variant="default" bordered shadow="sm" padding="default">
      <div
        className="p-4 rounded-lg border border-border text-white space-y-3 [&_input]:bg-white [&_input]:text-gray-900"
        style={ { backgroundColor: getColor() } }
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            For 组件
          </h3>
          <span className="text-xs opacity-90">
            渲染
            {' '}
            { renderCountRef.current }
            {' '}
            次 ·
            {' '}
            { new Date().toLocaleTimeString() }
          </span>
        </div>
        <p className="text-sm opacity-90">
          For each 渲染 signal 数组，自动缓存列表项，支持 fallback
        </p>

        <div className="space-y-2">
          <Button variant="primary" size="sm" onClick={ addItem }>
            添加项
          </Button>

          <For
            each={ items }
            fallback={ <p className="opacity-75 text-sm">No items</p> }
          >
            { item => (
              <div
                key={ item.id }
                className="flex items-center gap-2 py-1 border-b border-white/30 last:border-0"
              >
                <Input
                  value={ item.value }
                  onChange={ value => updateItem(item.id, value) }
                  className="flex-1 min-w-0"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={ () => removeItem(item.id) }
                >
                  删除
                </Button>
              </div>
            ) }
          </For>
        </div>
      </div>
    </Card>
  )
})
