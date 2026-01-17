'use client'

import { IMG_URLS } from 'config'
import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { PreviewImg } from './index'

export default function Test() {
  const [previewSrc, setPreviewSrc] = useState<string | string[] | null>(null)

  /** 多图预览测试数据 */
  const multiImages = IMG_URLS.slice(0, 5)

  return (
    <div className="mx-auto p-6 container space-y-8">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">PreviewImg 组件测试</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">单图预览 - 基础用法</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          点击下方任意图片预览大图，支持缩放、旋转和拖动操作。使用鼠标滚轮缩放，拖动移动图片。
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          { IMG_URLS.slice(0, 6).map((src, index) => (
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

        { previewSrc && typeof previewSrc === 'string' && (
          <PreviewImg
            src={ previewSrc }
            onClose={ () => setPreviewSrc(null) }
          />
        ) }
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">多图预览 - 顶部轮播切换</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          传入图片数组，顶部会显示轮播图，可以切换查看不同的图片。支持键盘方向键切换（← →）。
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={ () => setPreviewSrc(IMG_URLS.concat(IMG_URLS)) }
            >
              预览多张图片
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            { multiImages.map((src, index) => (
              <div
                key={ index }
                className="aspect-square cursor-pointer overflow-hidden rounded-md bg-gray-100 transition-opacity dark:bg-gray-800 hover:opacity-90"
                onClick={ () => setPreviewSrc(multiImages) }
              >
                <img
                  src={ src }
                  alt={ `多图预览 ${index + 1}` }
                  className="h-full w-full object-cover"
                />
              </div>
            )) }
          </div>
        </div>

        { previewSrc && Array.isArray(previewSrc) && (
          <PreviewImg
            src={ previewSrc }
            onClose={ () => setPreviewSrc(null) }
            orientation="horizontal"
          />
        ) }
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">按钮触发预览</h2>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            { IMG_URLS.slice(0, 5).map((src, index) => (
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
        <h2 className="mb-4 text-xl font-semibold dark:text-white">功能说明</h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>
            <strong>单图预览：</strong>
            传入字符串 URL，直接预览单张图片
          </p>
          <p>
            <strong>多图预览：</strong>
            传入图片数组，顶部显示轮播图，可切换查看
          </p>
          <p><strong>操作说明：</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>鼠标滚轮：缩放图片</li>
            <li>鼠标拖动：移动图片位置</li>
            <li>旋转按钮：顺时针旋转 90 度</li>
            <li>重置按钮：恢复初始状态</li>
            <li>方向键 ← →：多图时切换图片（仅多图模式）</li>
            <li>ESC 键：关闭预览</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
