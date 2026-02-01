/**
 * computed 派生状态
 * 多个 signal 组合成新的只读 signal，懒更新
 */
import { getColor } from '@jl-org/tool'
import { computed, signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Card, Input } from 'comps'
import { memo, useRef } from 'react'

const firstName = signal('Jane')
const lastName = signal('Doe')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

export const SignalComputed = memo(() => {
  useSignals()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <Card variant="default" bordered shadow="sm" padding="default">
      <div
        className="p-4 rounded-lg border border-border text-white space-y-3 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder-gray-500"
        style={ { backgroundColor: getColor() } }
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            computed 派生状态
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
          computed(fn) 从多个 signal 派生新值，懒更新，无订阅者时不会重新计算
        </p>

        <div className="flex flex-wrap gap-3">
          <Input
            value={ firstName.value }
            onChange={ value => (firstName.value = value) }
            placeholder="名"
            className="w-24"
          />
          <Input
            value={ lastName.value }
            onChange={ value => (lastName.value = value) }
            placeholder="姓"
            className="w-24"
          />
          <span className="opacity-90 self-center">
            全名:
            {' '}
            <strong className="text-systemGreen">{ fullName.value }</strong>
          </span>
        </div>
      </div>
    </Card>
  )
})
