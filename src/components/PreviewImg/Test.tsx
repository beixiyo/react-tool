'use client'

import { IMG_URLS } from '@/config'
import { useNotifyParentReady } from '@/hooks'
import { memo, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { PreviewImg } from './index'

const PreviewImgTest = memo(() => {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  /** 更多的图片URL，用于测试 */
  const allImages = [
    ...IMG_URLS,
  ]

  return (
    <div className="mx-auto p-6 container space-y-8">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">PreviewImg 组件测试</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">基础用法</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          点击下方任意图片预览大图，支持缩放、旋转和拖动操作。
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          { IMG_URLS.map((src, index) => (
            <div
              key={ index }
              className="aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-opacity dark:bg-gray-800 hover:opacity-90"
              onClick={ () => setPreviewSrc(src) }
            >
              <img
                src={ src }
                alt={ `示例图片 ${index + 1}` }
                className="h-full w-full object-cover"
              />
            </div>
          )) }
        </div>

        { previewSrc && (
          <PreviewImg
            src={ previewSrc }
            onClose={ () => setPreviewSrc(null) }
          />
        ) }
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">按钮触发预览</h2>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            { IMG_URLS.map((src, index) => (
              <Button
                key={ index }
                onClick={ () => setPreviewSrc(src) }
              >
                预览图片
                { ' ' }
                { index + 1 }
              </Button>
            )) }
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">图片画廊</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 sm:grid-cols-3">
          { allImages.map((src, index) => (
            <div
              key={ index }
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-gray-100 transition-opacity dark:bg-gray-800 hover:opacity-90"
              onClick={ () => setPreviewSrc(src) }
            >
              <img
                src={ src }
                alt={ `画廊图片 ${index + 1}` }
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all group-hover:bg-opacity-30 group-hover:opacity-100">
                <span className="text-white font-medium">点击预览</span>
              </div>
            </div>
          )) }
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">实际应用场景</h2>
        <div className="space-y-6">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="md:w-1/2">
              <h3 className="mb-4 text-lg font-medium dark:text-white">产品详情页</h3>
              <div className="border rounded-lg bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-4">
                  <div
                    className="aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                    onClick={ () => setPreviewSrc(IMG_URLS[0]) }
                  >
                    <img
                      src={ IMG_URLS[0] }
                      alt="产品主图"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    { IMG_URLS.map((src, index) => (
                      <div
                        key={ index }
                        className={ `w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${previewSrc === src
                          ? 'ring-2 ring-blue-500'
                          : ''}` }
                        onClick={ () => setPreviewSrc(src) }
                      >
                        <img
                          src={ src }
                          alt={ `缩略图 ${index + 1}` }
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )) }
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-medium dark:text-white">高品质产品名称</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    产品描述内容，点击上方图片可以查看大图，支持缩放、旋转和拖动操作。
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Button>加入购物车</Button>
                    <Button>收藏</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2">
              <h3 className="mb-4 text-lg font-medium dark:text-white">照片墙</h3>
              <div className="grid grid-cols-3 gap-1">
                { allImages.slice(0, 9).map((src, index) => (
                  <div
                    key={ index }
                    className="aspect-square cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-700"
                    onClick={ () => setPreviewSrc(src) }
                  >
                    <img
                      src={ src }
                      alt={ `照片 ${index + 1}` }
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )) }
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})

PreviewImgTest.displayName = 'PreviewImgTest'

export default PreviewImgTest
