'use client'

import { useState } from 'react'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card } from '../Card'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { ImgThumbnails } from '.'
import type { ImgThumbnailsOrientation } from './types'

const IMAGES = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/id/${i + 10}/320/320`)
const ORIENTATIONS: ImgThumbnailsOrientation[] = ['horizontal', 'vertical']

function ImgThumbnailsTest() {
  const [index, setIndex] = useState(0)
  const [orientation, setOrientation] = useState<ImgThumbnailsOrientation>('horizontal')
  const [thumbSize, setThumbSize] = useState(60)
  const [hideBorder, setHideBorder] = useState(false)
  const [hideHighlight, setHideHighlight] = useState(false)
  const [customIndex, setCustomIndex] = useState(0)

  const go = (step: number) => setIndex((i) => (i + step + IMAGES.length) % IMAGES.length)

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="ImgThumbnails 缩略图列表"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <Card title="控制面板" variant="glass" padding="lg">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              { ORIENTATIONS.map((item) => (
                <Button
                  key={ item }
                  size="sm"
                  variant={ orientation === item
                    ? 'primary'
                    : 'default' }
                  onClick={ () => setOrientation(item) }
                >
                  { item }
                </Button>
              )) }
              <Button size="sm" variant="ghost" onClick={ () => go(-1) }>上一张</Button>
              <Button size="sm" variant="ghost" onClick={ () => go(1) }>下一张</Button>
              <Badge>{ `${index + 1} / ${IMAGES.length}` }</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">thumbSize</Badge>
                <Badge>{ `${thumbSize}px` }</Badge>
              </div>
              <Slider className="w-full" min={ 32 } max={ 96 } step={ 4 } value={ thumbSize } onChange={ setThumbSize } />
            </div>

            <div className="flex flex-wrap gap-6">
              <Switch checked={ hideBorder } onChange={ setHideBorder } label="hideBorder" />
              <Switch checked={ hideHighlight } onChange={ setHideHighlight } label="hideHighlight" />
            </div>
          </div>
        </Card>

        <Card title="预览" variant="glass" padding="lg">
          <div
            className={ orientation === 'vertical'
              ? 'flex h-105 gap-4'
              : 'flex flex-col gap-4' }
          >
            <img
              src={ IMAGES[index] }
              alt={ `Preview ${index + 1}` }
              className="aspect-square max-h-80 rounded-xl object-cover"
            />
            <ImgThumbnails
              images={ IMAGES }
              currentIndex={ index }
              onImageChange={ setIndex }
              orientation={ orientation }
              thumbSize={ thumbSize }
              hideBorder={ hideBorder }
              hideHighlight={ hideHighlight }
              style={ orientation === 'vertical'
                ? { maxHeight: 420 }
                : undefined }
            />
          </div>
        </Card>

        <Card title="自定义 renderThumb 与选中态类名" variant="glass" padding="lg">
          <ImgThumbnails
            images={ IMAGES.slice(0, 6) }
            currentIndex={ customIndex }
            onImageChange={ setCustomIndex }
            orientation="horizontal"
            thumbSize={ 48 }
            thumbClassName="rounded-full"
            activeThumbClassName="ring-2 ring-info"
            inactiveThumbClassName="opacity-60 hover:opacity-100"
            renderThumb={ ({ index: i, active }) => (
              <span
                className={ active
                  ? 'flex size-full items-center justify-center bg-info text-sm font-semibold text-background'
                  : 'flex size-full items-center justify-center bg-background2 text-sm text-text2' }
              >
                { i + 1 }
              </span>
            ) }
          />
        </Card>

        <Card title="边界情况" variant="glass" padding="lg" bodyClassName="space-y-4">
          <div className="space-y-2">
            <Badge variant="outline">单张图片</Badge>
            <ImgThumbnails images={ IMAGES.slice(0, 1) } currentIndex={ 0 } onImageChange={ () => {} } orientation="horizontal" />
          </div>
          <div className="space-y-2">
            <Badge variant="outline">空数组：不渲染任何内容</Badge>
            <ImgThumbnails images={ [] } currentIndex={ 0 } onImageChange={ () => {} } orientation="horizontal" />
          </div>
        </Card>
      </div>
    </Card>
  )
}

export default ImgThumbnailsTest
