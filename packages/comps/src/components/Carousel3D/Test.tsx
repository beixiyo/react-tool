import { IMG_URLS } from 'config'
import { Carousel3D } from '.'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

const images = IMG_URLS.slice(0, 6)

function Test() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Carousel3D 3D 轮播</h1>
            <p className="mt-1 text-sm text-text2">透视旋转的图片轮播，支持自动播放、偏移/缩放/透明度配置</p>
          </div>
          <ThemeToggle />
        </header>

        <Card title="基本用法（自动播放）">
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg bg-[#490eff55]">
            <Carousel3D srcs={ images } className="h-64" />
          </div>
        </Card>

        <Card title="更大的偏移与更慢的速度">
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg bg-[#490eff55]">
            <Carousel3D
              srcs={ images }
              className="h-64"
              offsetStep={ 140 }
              duration={ 3500 }
            />
          </div>
        </Card>

        <Card title="关闭自动播放">
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg bg-[#490eff55]">
            <Carousel3D srcs={ images } className="h-64" autoPlay={ false } />
          </div>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default Test
