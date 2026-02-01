/* eslint-disable ts/no-unused-expressions */
/**
 * batch 批量更新
 * 合并多次 signal 写入为一次更新，减少不必要的重渲染
 */
import { getColor, randomStr } from '@jl-org/tool'
import { batch, computed, effect, signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const name = signal('Jane')
const surname = signal('Doe')
const fullName = computed(() => `${name.value} ${surname.value}`)
const effectRunCount = signal(0)

effect(() => {
  // 读取一次建立订阅，后续变化会自动触发
  fullName.value
  effectRunCount.value = effectRunCount.peek() + 1
})

export const SignalBatch = memo(() => {
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
            batch 批量更新
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
          batch(fn) 将多次 signal 写入合并为一次更新，effect 只触发一次
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-90">
            全名:
            {' '}
            <strong>{ fullName.value }</strong>
          </span>
          <span className="opacity-75 text-sm">
            effect 触发次数:
            {' '}
            <strong>{ effectRunCount.value }</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              batch(() => {
                name.value = `John${randomStr()}`
                surname.value = `Smith${randomStr()}`
              })
            } }
          >
            批量更新 (batch)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              name.value = `Jane${randomStr()}`
              surname.value = `Doe${randomStr()}`
            } }
          >
            分两次更新 (无 batch)
          </Button>
        </div>
      </div>
    </Card>
  )
})
