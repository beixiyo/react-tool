import { useState } from 'react'
import { cn } from 'utils'
import { GithubSourceLink } from '../GithubSourceLink'
import { Loading } from './Loading'
import { LoadingIcon } from './LoadingIcon'

function LoadingTest() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="mx-auto max-w-2xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold text-text">Loading 组件测试</h1>

      { /* LoadingIcon 尺寸，默认即 gradient 形态 */ }
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">默认形态尺寸（gradient）</h2>
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

      { /* 显式退回单色环 */ }
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">单色环 ring</h2>
        <div className="flex items-center gap-6">
          <LoadingIcon size="lg" ring />
          <LoadingIcon size="lg" gradient={ false } />
          <LoadingIcon size="lg" ring={ { color: 'rgb(var(--brand) / 1)' } } />
          <LoadingIcon size="lg" ring={ { color: 'rgb(var(--systemGreen) / 1)' } } />
          <LoadingIcon size="lg" ring={ { color: 'rgb(var(--systemOrange) / 1)' } } />
          <LoadingIcon size="lg" ring={ { color: 'rgb(var(--danger) / 1)' } } />
          { /* 轨道色也可定制 */ }
          <LoadingIcon
            size="lg"
            ring={ {
              color: 'rgb(var(--systemPurple) / 1)',
              trackColor: 'rgb(var(--systemPurple) / 0.2)',
            } }
          />
        </div>
      </section>

      { /* 渐变圆环 */ }
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">渐变定制 gradient</h2>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size="sm" />
            <span className="text-xs text-text3">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size="lg" />
            <span className="text-xs text-text3">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size={ 64 } />
            <span className="text-xs text-text3">64px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size={ 64 } thickness={ 2 } />
            <span className="text-xs text-text3">细环</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size={ 64 } thickness={ 10 } />
            <span className="text-xs text-text3">粗环</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <LoadingIcon size="lg" gradient={ { to: 'rgb(var(--brand) / 1)' } } />
          <LoadingIcon size="lg" gradient={ { to: 'rgb(var(--systemGreen) / 1)' } } />
          <LoadingIcon size="lg" gradient={ { to: 'rgb(var(--danger) / 1)' } } />
          { /* 起始色也可自定义，形成两色渐变 */ }
          <LoadingIcon
            size="lg"
            gradient={ {
              from: 'rgb(var(--brand) / 1)',
              to: 'rgb(var(--systemPurple) / 1)',
            } }
          />
        </div>
      </section>

      { /* 动画参数 */ }
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">动画参数 animation</h2>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size={ 40 } />
            <span className="text-xs text-text3">默认 800ms</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size={ 40 } animation={ { duration: 2400 } } />
            <span className="text-xs text-text3">慢速</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon gradient size={ 40 } animation={ { direction: 'reverse' } } />
            <span className="text-xs text-text3">反向</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingIcon
              gradient
              size={ 40 }
              animation={ { duration: 1600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' } }
            />
            <span className="text-xs text-text3">缓动</span>
          </div>
        </div>
      </section>

      { /* Loading 遮罩层 */ }
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">Loading 遮罩</h2>
        <button
          className={ cn(
            'rounded-lg px-4 py-2 text-sm transition-colors',
            loading
              ? 'bg-danger text-white'
              : 'bg-brand text-white',
          ) }
          onClick={ () => setLoading((v) => !v) }
        >
          { loading
            ? '关闭 Loading'
            : '开启 Loading' }
        </button>

        <div className="relative h-48 overflow-hidden rounded-xl border border-border bg-background2">
          <div className="flex h-full items-center justify-center">
            <p className="text-text2">被遮罩的内容区域</p>
          </div>
          <Loading
            loading={ loading }
            iconProps={ { gradient: { to: 'rgb(var(--brand) / 1)' } } }
          />
        </div>
      </section>

      { /* Loading 骨架屏 */ }
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">骨架屏模式</h2>
        <div className="relative h-48 overflow-hidden rounded-xl border border-border bg-background2">
          <Loading variant="skeleton" />
        </div>
      </section>

      <GithubSourceLink />
    </div>
  )
}

export default LoadingTest
