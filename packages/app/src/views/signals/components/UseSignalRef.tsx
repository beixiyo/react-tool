/**
 * useSignalRef
 * 创建行为类似 ref 的 signal，有 .current 属性
 */
import { getColor } from '@jl-org/tool'
import { useSignals } from '@preact/signals-react/runtime'
import { useSignalRef } from '@preact/signals-react/utils'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

export const UseSignalRef = memo(() => {
  useSignals()
  const divRef = useSignalRef<HTMLDivElement | null>(null)
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
            useSignalRef
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
          useSignalRef 创建类似 React ref 的 signal，有 .current，可触发响应式更新
        </p>

        <div ref={ divRef } className="rounded-sm bg-white/20 p-3">
          <p className="text-sm">这个 div 的 ref 已绑定</p>
        </div>

        <div className="text-sm opacity-90">
          divRef.current 是否存在:
          {' '}
          <strong>{ divRef.current ? '是' : '否' }</strong>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={ () => {
            if (divRef.current) {
              divRef.current.textContent = `已更新于 ${Date.now()}`
            }
          } }
        >
          通过 ref 修改内容
        </Button>
      </div>
    </Card>
  )
})
