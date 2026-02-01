/**
 * useLiveSignal(value: T): Signal<T>
 *
 * 将外部值转换为持续同步的本地 Signal（值 → Signal 的桥梁）
 *
 * @description
 * - 接收普通值（props、external.value 等），返回与之保持同步的本地 signal
 * - 每次渲染时比较值，不同则更新；不应修改返回的 signal（会被覆盖）
 *
 * @comparison 与 useSignal 的区别
 * - useSignal(initialValue)：只用初始值一次，外部变化不同步
 * - useLiveSignal(value)：每次渲染都同步，外部变 → 本地跟着变
 *
 * @example
 * // 父组件传 props
 * <Child count={countFromProps} />
 *
 * function Child({ count }: { count: number }) {
 *   const countSignal = useLiveSignal(count)  // props 变 → signal 同步更新
 *   return <SomeLibComponent value={countSignal} />  // 库要求 Signal 类型
 * }
 *
 * @useCase
 * 1. 对接需要 Signal 的库/组件，但数据来源是普通 props
 * 2. 在 Signal 生态（effect、computed）中消费外部传入的值
 */
import { getColor } from '@jl-org/tool'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLiveSignal } from '@preact/signals-react/utils'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const external = signal(0)

export const UseLiveSignal = memo(() => {
  useSignals()
  // 正确：传入 external.value（值），不是 external（Signal）
  // 会订阅 external，当其变化时重渲染并同步到 local
  const local = useLiveSignal(external.value)
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
            useLiveSignal
          </h3>
          <span className="text-xs opacity-90">
            渲染
            {' '}
            {renderCountRef.current}
            {' '}
            次 ·
            {' '}
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm opacity-90">
          useLiveSignal(value) 接收值，返回与之同步的本地 signal。external 变化 → local 自动更新
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="opacity-90">
            external:
            {' '}
            <strong>{external.value}</strong>
          </span>
          <span className="opacity-90">
            local:
            {' '}
            <strong className="text-systemGreen">{local.value}</strong>
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={ () => {
              external.value += 1
            } }
          >
            external +1
          </Button>
        </div>
        <p className="text-xs opacity-70">
          修改 local 会在下次渲染时被 external.value 覆盖，仅作只读镜像使用
        </p>
      </div>
    </Card>
  )
})
