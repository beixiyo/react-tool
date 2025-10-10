'use client'

import { IMG_URLS } from 'config'
import { memo, useState } from 'react'
import { Card } from '../Card'
import { Input } from '../Input'
import { Slider } from '../Slider'
import { ImgTransition } from './index'

const ImgTransitionTest = memo(() => {
  const [interval, setInterval] = useState(3000)
  const [customUrls, setCustomUrls] = useState<string[]>([...IMG_URLS])
  const [newUrl, setNewUrl] = useState('')

  /** 更多的图片URL，用于测试 */
  const moreImages = [
    ...IMG_URLS,
    'https://images.unsplash.com/photo-1682687220208-22d7a2543e88?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1682687220923-c58b9a4592ea?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1686002359940-6a51b0d64f68?q=80&w=1374&auto=format&fit=crop',
  ]

  const handleAddUrl = () => {
    if (newUrl && !customUrls.includes(newUrl)) {
      setCustomUrls([...customUrls, newUrl])
      setNewUrl('')
    }
  }

  const handleRemoveUrl = (index: number) => {
    if (customUrls.length > 2) {
      const newUrls = [...customUrls]
      newUrls.splice(index, 1)
      setCustomUrls(newUrls)
    }
  }

  return (
    <div className="mx-auto p-6 container space-y-8">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">ImgTransition 组件测试</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">基础用法</h2>
        <div className="h-64 w-full overflow-hidden rounded-lg">
          <ImgTransition srcs={ IMG_URLS } />
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          默认3秒切换一次图片
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">自定义切换间隔</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-gray-300">
              切换间隔:
              {interval}
              ms
            </label>
            <Slider
              min={ 500 }
              max={ 10000 }
              step={ 10 }
              value={ interval }
              onChange={ val => setInterval(val) }
            />
          </div>

          <div className="h-64 w-full overflow-hidden rounded-lg">
            <ImgTransition srcs={ IMG_URLS } interval={ interval } />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">更多图片</h2>
        <div className="h-64 w-full overflow-hidden rounded-lg">
          <ImgTransition srcs={ moreImages } interval={ 2000 } />
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          使用更多图片，每2秒切换一次
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">自定义图片集</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="输入图片URL"
                value={ newUrl }
                onChange={ setNewUrl }
                className="flex-1"
              />
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={ handleAddUrl }
              >
                添加
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2 dark:border-gray-700">
              {customUrls.map((url, index) => (
                <div key={ index } className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
                      <img src={ url } alt={ `预览 ${index}` } className="h-full w-full object-cover" />
                    </div>
                    <span className="max-w-[300px] truncate dark:text-gray-300">{url}</span>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={ () => handleRemoveUrl(index) }
                    disabled={ customUrls.length <= 2 }
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="h-64 w-full overflow-hidden rounded-lg">
            <ImgTransition srcs={ customUrls } interval={ 3000 } />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">不同尺寸和样式</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-medium dark:text-white">圆角样式</h3>
            <div className="h-48 w-full overflow-hidden rounded-2xl">
              <ImgTransition
                srcs={ IMG_URLS }
                imgClassName="rounded-2xl"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium dark:text-white">正方形裁剪</h3>
            <div className="mx-auto h-48 w-48 overflow-hidden rounded-lg">
              <ImgTransition
                srcs={ IMG_URLS }
                imgClassName="object-cover h-full"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium dark:text-white">圆形裁剪</h3>
            <div className="mx-auto h-48 w-48 overflow-hidden rounded-full">
              <ImgTransition
                srcs={ IMG_URLS }
                imgClassName="object-cover h-full rounded-full"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium dark:text-white">带边框</h3>
            <div className="h-48 w-full border-4 border-blue-500 rounded-lg p-2">
              <ImgTransition
                srcs={ IMG_URLS }
                className="h-full"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">实际应用场景</h2>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-1/2">
            <div className="h-80 w-full overflow-hidden rounded-lg">
              <ImgTransition srcs={ moreImages } interval={ 4000 } />
            </div>
          </div>

          <div className="flex flex-col justify-center md:w-1/2">
            <h3 className="mb-4 text-2xl font-bold dark:text-white">产品展示</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              使用ImgTransition组件可以创建流畅的图片轮播效果，适合用于产品展示、照片集或背景图片切换等场景。
              通过自定义间隔时间和过渡效果，可以实现不同的视觉体验。
            </p>
            <button className="self-start rounded-lg bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600">
              了解更多
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
})

ImgTransitionTest.displayName = 'ImgTransitionTest'

export default ImgTransitionTest
