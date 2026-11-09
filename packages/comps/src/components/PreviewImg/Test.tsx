'use client'

import { IMG_URLS } from 'config'
import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { Message } from '../Message'
import { ThemeToggle } from '../ThemeToggle'
import { PreviewImg } from './index'
import { Z } from '../../constants/z-index';

function Test() {
  const [previewSrc, setPreviewSrc] = useState<string | string[] | null>(null)

  /** imageMaxWidth 演示：与基础预览分开的状态，避免互相干扰 */
  const [maxWidthPreviewSrc, setMaxWidthPreviewSrc] = useState<string | string[] | null>(null)

  /** onCopy 演示：反馈由调用方自行处理 */
  const [customCopySrc, setCustomCopySrc] = useState<string | null>(null)

  /** 多图预览测试数据 */
  const multiImages = IMG_URLS.slice(0, 5)

  return (
    <div className="bg-background text-text min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">PreviewImg 组件测试</h1>
          <ThemeToggle />
        </header>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">单图预览 - 基础用法</h2>
          <p className="text-text2 mb-4">
            点击下方任意图片预览大图，支持缩放、旋转和拖动操作。使用鼠标滚轮缩放，拖动移动图片，Ctrl/Cmd+C 复制当前图片
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            { IMG_URLS.slice(0, 6).map((src, index) => (
              <div
                key={ index }
                className="bg-background3 aspect-video cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90"
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
              orientation="vertical"
              toolbar={ { items: ['copy', 'download'] } }
            />
          ) }
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">多图预览 - 顶部轮播切换</h2>
          <p className="text-text2 mb-4">
            传入图片数组，顶部会显示轮播图，可以切换查看不同的图片。支持键盘方向键切换（← →）与 Ctrl/Cmd+C 复制当前图片
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
                  className="bg-background3 aspect-square cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-90"
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
              toolbar={ { items: ['copy', 'download'] } }
            />
          ) }
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">限制最大宽度 - imageMaxWidth</h2>
          <p className="text-text2 mb-4">
            配置 <code>imageMaxWidth=&#123;800&#125;</code>{' '}
            后，大图基准显示宽度最大 800px（与视口可用宽度取小值），滚轮缩放仍可放大 对比上方基础用法：宽图不再撑满整个视口
          </p>

          <div className="flex flex-wrap gap-4">
            <Button onClick={ () => setMaxWidthPreviewSrc(IMG_URLS[0]) }>
              单图预览（最大 800px）
            </Button>
            <Button onClick={ () => setMaxWidthPreviewSrc(multiImages) }>
              多图预览（最大 800px）
            </Button>
          </div>

          { maxWidthPreviewSrc && (
            <PreviewImg
              src={ maxWidthPreviewSrc }
              onClose={ () => setMaxWidthPreviewSrc(null) }
              imageMaxWidth={ 800 }
            />
          ) }
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">按钮触发预览</h2>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              { IMG_URLS.slice(0, 5).map((src, index) => (
                <Button
                  key={ index }
                  onClick={ () => setPreviewSrc(src) }
                >
                  预览图片 { index + 1 }
                </Button>
              )) }
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">自定义复制反馈 - onCopy</h2>
          <p className="text-text2 mb-4">
            传入 onCopy 后组件不再弹默认消息，成功与失败都回调给调用方自行提示。预览中按 Ctrl/Cmd+C 查看效果
          </p>

          <Button onClick={ () => setCustomCopySrc(IMG_URLS[0]) }>
            预览图片（onCopy 自定义提示）
          </Button>

          { customCopySrc && (
            <PreviewImg
              src={ customCopySrc }
              onClose={ () => setCustomCopySrc(null) }
              onCopy={ (result) => {
                if (result.success) Message.success({
                  content: 'onCopy：调用方自行提示（已复制）',
                  zIndex: Z.preview + 1
                })
                else Message.error('onCopy：调用方自行提示（复制失败）')
              } }
            />
          ) }
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">功能说明</h2>
          <div className="text-text2 space-y-2">
            <p>
              <strong>单图预览：</strong>
              传入字符串 URL，直接预览单张图片
            </p>
            <p>
              <strong>多图预览：</strong>
              传入图片数组，顶部显示轮播图，可切换查看
            </p>
            <p>
              <strong>操作说明：</strong>
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>鼠标滚轮：缩放图片</li>
              <li>鼠标拖动：移动图片位置</li>
              <li>旋转按钮：顺时针旋转 90 度</li>
              <li>重置按钮：恢复初始状态</li>
              <li>方向键 ← →：多图时切换图片（仅多图模式）</li>
              <li>Ctrl/Cmd+C：复制当前图片到剪贴板</li>
              <li>ESC 键：关闭预览</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Test
