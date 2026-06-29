'use client'

import { useCallback, useState } from 'react'
import { PixelStyle } from '.'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'

export function PixelTestPage() {
  const [isPixel, setIsPixel] = useState<boolean>(false)
  const [gradient, setGradient] = useState<number>(1)
  const [size, setSize] = useState<number>(4)
  const [drop, setDrop] = useState<number>(4)

  const imageUrl = 'https://picsum.photos/200/300'

  const handleTogglePixel = useCallback((checked: boolean) => {
    setIsPixel(checked)
  }, [])

  const labelClass = 'w-20 shrink-0 text-sm font-medium text-text2'
  const sliderRowClass = 'flex items-center gap-3 mb-4'
  const valueDisplayClass = 'w-8 shrink-0 text-right text-sm text-text2'

  return (
    <div className="mx-auto min-h-screen flex flex-col items-center bg-background p-6 text-text container">
      <div className="mb-6 w-full max-w-md flex items-center justify-between">
        <h1 className="text-2xl font-semibold">像素化效果配置</h1>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        {/* 开关 */ }
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="text-sm text-text font-medium">正常</span>
          <Switch checked={ isPixel } onChange={ handleTogglePixel } />
          <span className="text-sm text-text font-medium">像素</span>
        </div>

        {/* 滑块控制区域 */ }
        <div className={ sliderRowClass }>
          <div className={ labelClass }>渐变：</div>
          <Slider
            className="flex-1"
            min={ 0 }
            max={ 10 }
            step={ 0.1 }
            value={ gradient }
            onChange={ setGradient }
            disabled={ !isPixel }
          />
          <span className={ valueDisplayClass }>{ gradient }</span>
        </div>

        <div className={ sliderRowClass }>
          <div className={ labelClass }>大小：</div>
          <Slider
            className="flex-1"
            min={ 1 }
            max={ 20 }
            step={ 0.1 }
            value={ size }
            onChange={ setSize }
            disabled={ !isPixel }
          />
          <span className={ valueDisplayClass }>{ size }</span>
        </div>

        <div className={ sliderRowClass }>
          <div className={ labelClass }>模糊：</div>
          <Slider
            className="flex-1"
            min={ 0 }
            max={ 10 }
            step={ 0.1 }
            value={ drop }
            onChange={ setDrop }
            disabled={ !isPixel }
          />
          <span className={ valueDisplayClass }>{ drop }</span>
        </div>

        {/* 内容展示区域 */ }
        <div className="mt-8 overflow-hidden border border-border rounded-lg">
          {/* 为 PixelStyle 的父 div 提供明确的尺寸 */ }
          <div className="mx-auto my-4 h-[200px] w-[300px]">
            <PixelStyle
              isPixelActive={ isPixel }
              gradient={ gradient }
              pixelSize={ size }
              blurDrop={ drop }
            >
              <img
                className="h-full w-full object-cover"
                src={ imageUrl }
                alt="示例图片"
              />
            </PixelStyle>
          </div>
        </div>
      </Card>

      <GithubSourceLink />
    </div>
  )
}

export default PixelTestPage
