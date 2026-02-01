/**
 * signal 基础用法（Babel transform 自动订阅）
 * 创建响应式状态，组件访问 .value 时自动订阅更新
 */
import { getColor } from '@jl-org/tool'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const countSignal = signal(0)

export const SignalBasic = memo(() => {
  useSignals()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <Card variant="default" bordered shadow="sm" padding="default">
      <div
        className="p-4 rounded-lg border border-border text-white space-y-3"
        style={ { backgroundColor: getColor() } }
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            signal 基础
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
          signal(initialValue) 创建响应式状态，Babel transform 自动让组件订阅 signal 变化并重渲染
        </p>

        <div className="flex items-center gap-3">
          <span className="opacity-90">
            当前值:
            {' '}
            <strong>{ countSignal.value }</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              countSignal.value += 1
            } }
          >
            +1
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              countSignal.value = 0
            } }
          >
            重置
          </Button>
        </div>
      </div>
    </Card>
  )
})
