/**
 * 渲染优化
 * 将 signal 直接传入 JSX 可跳过 VDOM，直接更新 DOM 文本节点
 */
import { getColor } from '@jl-org/tool'
import { signal } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { Button, Card } from 'comps'
import { memo, useRef } from 'react'

const countUnoptimized = signal(0)
const countOptimized = signal(0)

const UnoptimizedDisplay = memo(() => {
  useSignals()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  console.log('UnoptimizedDisplay render', countUnoptimized.value)

  return (
    <div
      className="p-3 rounded text-white text-sm"
      style={ { backgroundColor: getColor() } }
    >
      <span className="opacity-90">未优化 (count.value): </span>
      <strong>{ countUnoptimized.value }</strong>
      <span className="ml-2 text-xs opacity-75">
        渲染
        { renderCountRef.current }
        {' '}
        次
      </span>
    </div>
  )
})

const OptimizedDisplay = memo(() => {
  useSignals()
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  // 不要解开注释，否则会视为依赖，导致重新渲染，失去 signal 优化不触发渲染效果
  // console.log('OptimizedDisplay render', countOptimized.value)

  return (
    <div
      className="p-3 rounded text-white text-sm"
      style={ { backgroundColor: getColor() } }
    >
      <span className="opacity-90">优化 (直接传 signal): </span>
      <strong><>{ countOptimized }</></strong>
      <span className="ml-2 text-xs opacity-75">
        渲染
        { renderCountRef.current }
        {' '}
        次
      </span>
    </div>
  )
})

export const RenderingOptimization = memo(() => {
  useSignals()
  return (
    <Card variant="default" bordered shadow="sm" padding="default">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-text">
          渲染优化
        </h3>
        <p className="text-sm text-text2">
          直接传 signal 到 JSX 可跳过 VDOM，直接绑定 DOM Text 节点更新。点击 +1 对比：未优化会变色（重渲染），优化侧可能不变色（直接更新 DOM）
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-border p-3 space-y-2">
            <p className="text-xs text-text3 font-medium">未优化</p>
            <UnoptimizedDisplay />
            <Button
              variant="primary"
              size="sm"
              onClick={ () => {
                countUnoptimized.value += 1
              } }
            >
              +1
            </Button>
          </div>

          <div className="rounded border border-systemGreen/50 p-3 space-y-2">
            <p className="text-xs text-systemGreen font-medium">优化</p>
            <OptimizedDisplay />
            <Button
              variant="primary"
              size="sm"
              onClick={ () => {
                countOptimized.value += 1
              } }
            >
              +1
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
})
