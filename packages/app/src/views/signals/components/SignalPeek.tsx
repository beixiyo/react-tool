/* eslint-disable ts/no-unused-expressions */
/**
 * signal.peek()
 * 读取 signal 值但不订阅，effect 内写入另一 signal 时避免循环依赖
 */
import { getColor } from '@jl-org/tool'
import { effect, signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const counter = signal(0)
const effectRunCount = signal(0)

effect(() => {
  // 读取一次建立订阅，后续变化会自动触发
  counter.value
  // 使用 peek 避免 effect 订阅 effectRunCount 造成无限循环
  effectRunCount.value = effectRunCount.peek() + 1
})

export const SignalPeek = memo(() => {
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
            signal.peek()
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
          peek() 读取值但不建立订阅，用于 effect 内写入另一 signal 时避免循环
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-90">
            counter:
            {' '}
            <strong>{ counter.value }</strong>
          </span>
          <span className="opacity-90">
            effect 执行次数:
            {' '}
            <strong className="text-systemOrange">{ effectRunCount.value }</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              counter.value += 1
            } }
          >
            +1
          </Button>
        </div>
      </div>
    </Card>
  )
})
