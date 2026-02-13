import { Button } from 'comps'
import { Github } from 'lucide-react'
/**
 * @preact/signals-react 功能演示页
 * @see https://github.com/preactjs/signals
 * @see https://www.npmjs.com/package/@preact/signals-react
 */
import {
  ForComponent,
  RenderingOptimization,
  ShowComponent,
  SignalBasic,
  SignalBatch,
  SignalComputed,
  SignalEffect,
  SignalHooks,
  SignalPeek,
  SignalUntracked,
  UseLiveSignal,
  UseSignalRef,
} from './components'

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-1">
              @preact/signals-react 演示
            </h1>
            <p className="text-text2 text-sm">
              Signal 是高性能响应式状态库，支持 signal、computed、effect、batch 等核心 API
            </p>
            <p className="text-text3 text-xs mt-1">
              背景色变化 = 组件重新渲染；渲染次数与最后渲染时间实时更新
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            variant="primary"
            onClick={ () =>
              window.open('https://github.com/beixiyo/react-tool/blob/main/packages/app/src/views/signals/page.tsx', '_blank') }
            leftIcon={ <Github className="w-4 h-4" /> }
          >
            GitHub
          </Button>
        </div>

        {/* Core API */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            核心 API
          </h2>
          <div className="grid gap-4">
            <SignalBasic />
            <SignalHooks />
            <SignalComputed />
            <SignalEffect />
            <SignalBatch />
            <SignalPeek />
            <SignalUntracked />
          </div>
        </section>

        {/* React 集成与优化 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            React 集成与渲染优化
          </h2>
          <RenderingOptimization />
        </section>

        {/* 工具组件与 Hooks */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            工具组件与 Hooks
          </h2>
          <div className="grid gap-4">
            <ShowComponent />
            <ForComponent />
            <UseLiveSignal />
            <UseSignalRef />
          </div>
        </section>
      </div>
    </div>
  )
}
