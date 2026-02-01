/**
 * untracked(fn)
 * 在 effect 内执行 fn 但不订阅其访问的 signals
 */
import { getColor } from '@jl-org/tool'
import { effect, signal, untracked } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const main = signal(0)
const side = signal(100)

effect(() => {
  const m = main.value
  // 不订阅 side，和 side.peek() 效果一样
  const s = untracked(() => side.value)
  console.log(`[untracked] main=${m}, side(untracked)=${s}`)
})

export const SignalUntracked = memo(() => {
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
            untracked(fn)
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
          untracked(fn) 在 effect 内执行 fn 但不订阅其访问的 signals，仅 main 变化会触发 effect
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-90">
            main:
            {' '}
            <strong>{ main.value }</strong>
          </span>
          <span className="opacity-90">
            side:
            {' '}
            <strong>{ side.value }</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              main.value += 1
            } }
          >
            main +1
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              side.value += 1
            } }
          >
            side +1
          </Button>
        </div>
        <p className="text-xs opacity-75">
          改 side 不会触发 effect，改 main 会触发（控制台可验证）
        </p>
      </div>
    </Card>
  )
})
