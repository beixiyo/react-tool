'use client'

import { IMG_URLS } from 'config'
import { LazyImg } from '.'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

const gallery = IMG_URLS.slice(0, 4)

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

        <Card title="基本用法">
          <p className="mb-4 text-sm text-text2">向下滚动，图片进入视口后才开始加载</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            { gallery.map((src, index) => (
              <LazyImg
                key={ index }
                src={ src }
                className="h-48 w-full overflow-hidden rounded-lg"
                imgClassName="size-full object-cover"
              />
            )) }
          </div>
        </Card>

        <Card title="错误兜底">
          <p className="mb-4 text-sm text-text2">图片加载失败时展示 errorText 兜底内容</p>
          <LazyImg
            src="/not-exist.png"
            errorText="图片被外星人偷走了"
            className="h-48 w-full max-w-sm overflow-hidden rounded-lg"
            imgClassName="size-full object-cover"
          />
        </Card>

        <Card title="禁用预览">
          <p className="mb-4 text-sm text-text2">previewable=false 时点击图片不会弹出大图预览</p>
          <LazyImg
            src={ gallery[0] }
            previewable={ false }
            className="h-48 w-full max-w-sm overflow-hidden rounded-lg"
            imgClassName="size-full object-cover"
          />
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default LazyImgTest
