import { useState } from 'react'
import { cn } from 'utils'
import { Loading } from './Loading'
import { LoadingIcon } from './LoadingIcon'

export default function LoadingTest() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="mx-auto max-w-2xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold text-text">Loading 组件测试</h1>

      {/* LoadingIcon 尺寸 */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">LoadingIcon 尺寸</h2>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon size="sm" />
            <span className="text-xs text-text3">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon size="md" />
            <span className="text-xs text-text3">md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon size="lg" />
            <span className="text-xs text-text3">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon size={ 48 } />
            <span className="text-xs text-text3">48px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon size={ 64 } />
            <span className="text-xs text-text3">64px</span>
          </div>
        </div>
      </section>

      {/* LoadingIcon 自定义颜色 */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">自定义颜色</h2>
        <div className="flex items-center gap-6">
          <LoadingIcon size="lg" color="rgb(var(--brand) / 1)" />
          <LoadingIcon size="lg" color="rgb(var(--systemGreen) / 1)" />
          <LoadingIcon size="lg" color="rgb(var(--systemOrange) / 1)" />
          <LoadingIcon size="lg" color="rgb(var(--danger) / 1)" />
          <LoadingIcon size="lg" color="rgb(var(--systemPurple) / 1)" />
        </div>
      </section>

      {/* Loading 遮罩层 */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">Loading 遮罩</h2>
        <button
          className={ cn(
            'rounded-lg px-4 py-2 text-sm transition-colors',
            loading
              ? 'bg-danger text-white'
              : 'bg-brand text-white',
          ) }
          onClick={ () => setLoading(v => !v) }
        >
          { loading
            ? '关闭 Loading'
            : '开启 Loading' }
        </button>

        <div className="relative h-48 overflow-hidden rounded-xl border border-border bg-background2">
          <div className="flex h-full items-center justify-center">
            <p className="text-text2">被遮罩的内容区域</p>
          </div>
          <Loading loading={ loading } />
        </div>
      </section>

      {/* Loading 骨架屏 */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">骨架屏模式</h2>
        <div className="relative h-48 overflow-hidden rounded-xl border border-border bg-background2">
          <Loading variant="skeleton" />
        </div>
      </section>
    </div>
  )
}
