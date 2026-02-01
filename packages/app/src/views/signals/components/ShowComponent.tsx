/**
 * Show 组件
 * 根据 signal 值条件渲染，支持 when/fallback，支持函数子节点访问值
 */
import { getColor } from '@jl-org/tool'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Show } from '@preact/signals-react/utils'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const isVisible = signal(false)

export const ShowComponent = memo(() => {
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
            Show 组件
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
          Show when/fallback 根据 signal 条件渲染，子节点可为函数以访问值
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={ () => {
                isVisible.value = !isVisible.value
              } }
            >
              切换显示
            </Button>
          </div>

          <Show
            when={ isVisible }
            fallback={ <p className="opacity-75 text-sm">Nothing to see here</p> }
          >
            <p className="text-systemGreen text-sm">Now you see me!</p>
          </Show>
        </div>
      </div>
    </Card>
  )
})
