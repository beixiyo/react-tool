/* eslint-disable ts/no-unused-expressions */
/**
 * effect 副作用
 * 响应 signal 变化执行副作用，可返回 cleanup，可 dispose
 */
import { getColor } from '@jl-org/tool'
import { effect, signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const effectCount = signal(0)
const runCount = signal(0)

effect(() => {
  // 读取一次建立订阅，后续变化会自动触发
  effectCount.value
  runCount.value = runCount.peek() + 1
})

export const SignalEffect = memo(() => {
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
            effect 副作用
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
          effect(fn) 响应 signal 变化执行副作用，可返回 cleanup，调用返回函数可 dispose
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-90">
            值:
            {' '}
            <strong>{ effectCount.value }</strong>
          </span>
          <span className="opacity-75 text-sm">
            effect 执行次数:
            {' '}
            <strong>{ runCount.value }</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              effectCount.value += 1
            } }
          >
            +1
          </Button>
        </div>
      </div>
    </Card>
  )
})
