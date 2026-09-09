'use client'

import { IMG_URLS } from 'config'
import type { ReactNode } from 'react'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { LazyImg } from '.'

const gallery = IMG_URLS.slice(0, 4)

/** 内联 svg 兜底图，避免 demo 依赖外部资源 */
const FALLBACK_SVG = `data:image/svg+xml;utf8,${
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(148,163,184)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  )
}`

/** 永不落地的解析器，把 LazyImg 钉在 loading 态供观察 */
const pendingForever = () => new Promise<never>(() => {})

const BOX = 'h-40 w-full overflow-hidden rounded-lg border border-border'

function Case({ label, children }: CaseProps) {
  return (
    <figure className="space-y-2">
      { children }
      <figcaption className="text-xs leading-relaxed text-text2">{ label }</figcaption>
    </figure>
  )
}

function LazyImgTest() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">LazyImg 组件</h1>
            <p className="mt-1 text-sm text-text2">进入视口后再加载的懒加载图片，支持占位、错误兜底与点击预览</p>
          </div>
          <ThemeToggle />
        </header>

        <Card title="错误占位">
          <p className="mb-4 text-sm text-text2">
            默认只渲染 ImageOff 图标（lucide 的 svg），不带任何文案。要文案时才显式传 errorText
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Case label="默认：只有 svg 图标，无文案">
              <LazyImg
                className={ BOX }
                lazy={ false }
                src="/not-exist-default.png"
              />
            </Case>

            <Case label="errorText：显式传才出文案">
              <LazyImg
                className={ BOX }
                errorText="图片加载失败"
                lazy={ false }
                src="/not-exist-text.png"
              />
            </Case>

            <Case label="errorSrc：自定义兜底图，替掉默认图标">
              <LazyImg
                className={ BOX }
                errorSrc={ FALLBACK_SVG }
                lazy={ false }
                src="/not-exist-custom.png"
              />
            </Case>

            <Case label="errorSrc 自己也挂了：回落到默认图标">
              <LazyImg
                className={ BOX }
                errorSrc="/broken-fallback.svg"
                lazy={ false }
                src="/not-exist-fallback.png"
              />
            </Case>
          </div>
        </Card>

        <Card title="空 src">
          <p className="mb-4 text-sm text-text2">src 为空且没有 resolveSource 时不发请求，直接进错误态</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Case label="src=&quot;&quot;：初始即 error">
              <LazyImg className={ BOX } lazy={ false } src="" />
            </Case>
          </div>
        </Card>

        <Card title="加载占位">
          <p className="mb-4 text-sm text-text2">
            解析器一直不落地，三个都停在 loading 态。注意 loadingText 会被默认骨架盖住，只有换成自定义 loading 节点时才可见
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <Case label="默认：Skeleton 骨架">
              <LazyImg
                className={ BOX }
                lazy={ false }
                resolveSource={ pendingForever }
                src="/pending-default.png"
              />
            </Case>

            <Case label="loadingText：被默认骨架盖住，看不见">
              <LazyImg
                className={ BOX }
                lazy={ false }
                loadingText="Loading…"
                resolveSource={ pendingForever }
                src="/pending-text.png"
              />
            </Case>

            <Case label="loading：整块换成自定义 JSX">
              <LazyImg
                className={ BOX }
                lazy={ false }
                loading={ <span className="text-xs text-text2">自定义占位</span> }
                resolveSource={ pendingForever }
                src="/pending-custom.png"
              />
            </Case>
          </div>
        </Card>

        <Card title="基本用法">
          <p className="mb-4 text-sm text-text2">向下滚动，图片进入视口后才开始加载；点击可打开预览</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            { gallery.map((src, index) => (
              <LazyImg
                key={ index }
                className="h-48 w-full overflow-hidden rounded-lg"
                imgClassName="size-full object-cover"
                src={ src }
              />
            )) }
          </div>
        </Card>

        <Card title="预览行为">
          <p className="mb-4 text-sm text-text2">
            previewImages 打开多图轮播；previewable=false 时点击不弹预览
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2">
            <Case label="previewImages：点击进多图轮播">
              <LazyImg
                className={ BOX }
                imgClassName="size-full object-cover"
                previewImages={ gallery }
                src={ gallery[0] }
              />
            </Case>

            <Case label="previewable=false：点击无反应">
              <LazyImg
                className={ BOX }
                imgClassName="size-full object-cover"
                previewable={ false }
                src={ gallery[1] }
              />
            </Case>
          </div>
        </Card>

        <Card title="宽高比">
          <p className="mb-4 text-sm text-text2">
            keepAspect 默认 true，未指定高度时按 1:1 占位；调用方给了高度就以调用方为准
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Case label="keepAspect 默认：1:1 方形占位">
              <LazyImg
                className="w-full overflow-hidden rounded-lg border border-border"
                imgClassName="size-full object-cover"
                src={ gallery[2] }
              />
            </Case>

            <Case label="keepAspect=false：撑满外层给定尺寸">
              <LazyImg
                className="h-32 w-full overflow-hidden rounded-lg border border-border"
                imgClassName="size-full object-cover"
                keepAspect={ false }
                src={ gallery[3] }
              />
            </Case>
          </div>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default LazyImgTest

type CaseProps = {
  label: string
  children: ReactNode
}
