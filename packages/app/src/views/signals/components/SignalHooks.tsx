/**
 * useSignal / useComputed / useSignalEffect Hooks
 * 在组件内部创建 signal、派生值、副作用
 */
import { getColor } from '@jl-org/tool'
import {
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

export const SignalHooks = memo(() => {
  useSignals()
  const count = useSignal(0)
  const double = useComputed(() => count.value * 2)
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  useSignalEffect(() => {
    console.log(`[useSignalEffect] count=${count.value}, double=${double.value}`)
    return () => console.log(`[cleanup] count was ${count.value}`)
  })

  return (
    <Card variant="default" bordered shadow="sm" padding="default">
      <div
        className="p-4 rounded-lg border border-border text-white space-y-3"
        style={ { backgroundColor: getColor() } }
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            useSignal / useComputed / useSignalEffect
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
          useSignal 创建组件内 signal，useComputed 派生值，useSignalEffect 响应变化（可返回 cleanup）
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-90">
            count:
            {' '}
            <strong>{ count.value }</strong>
          </span>
          <span className="opacity-90">
            count × 2:
            {' '}
            <strong className="text-systemOrange">{ double.value }</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              count.value += 1
            } }
          >
            +1
          </Button>
        </div>
        <p className="text-xs opacity-75">
          打开控制台查看 useSignalEffect 输出
        </p>
      </div>
    </Card>
  )
})
