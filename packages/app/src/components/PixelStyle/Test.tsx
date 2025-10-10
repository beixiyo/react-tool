'use client'

import React, { useCallback, useState } from 'react'
import { PixelStyle } from '.' // 确保路径正确

export function PixelTestPage() {
  const [isPixel, setIsPixel] = useState<boolean>(false)
  const [gradient, setGradient] = useState<number>(1)
  const [size, setSize] = useState<number>(4)
  const [drop, setDrop] = useState<number>(4)

  const imageUrl = 'https://picsum.photos/200/300'

  const handleTogglePixel = useCallback(() => {
    setIsPixel(prev => !prev)
  }, [])

  // Tailwind CSS 类定义
  const labelClass = 'w-20 text-sm font-medium text-gray-700'
  const sliderContainerClass = 'flex items-center mb-4'
  const sliderClass = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
  const sliderDisabledClass = 'opacity-50 cursor-not-allowed'
  const valueDisplayClass = 'ml-3 w-8 text-sm text-gray-600 text-right'

  return (
    <div className="mx-auto min-h-screen flex flex-col items-center bg-gray-50 p-6 container">
      <div className="max-w-md w-full rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl text-gray-800 font-semibold">像素化效果配置</h1>

        {/* 开关 */ }
        <div className="mb-6 flex items-center justify-center">
          <label htmlFor="pixelToggle" className="mr-3 text-sm text-gray-900 font-medium">正常</label>
          <button
            id="pixelToggle"
            onClick={ handleTogglePixel }
            aria-pressed={ isPixel }
            className={ `relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isPixel
              ? 'bg-blue-600'
              : 'bg-gray-300'
            }` }
          >
            <span
              className={ `inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isPixel
                ? 'translate-x-6'
                : 'translate-x-1'
              }` }
            />
          </button>
          <label htmlFor="pixelToggle" className="ml-3 text-sm text-gray-900 font-medium">像素</label>
        </div>

        {/* 滑块控制区域 */ }
        <div className={ sliderContainerClass }>
          <div className={ labelClass }>渐变：</div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1" // 更细致的控制
            value={ gradient }
            onChange={ e => setGradient(Number(e.target.value)) }
            disabled={ !isPixel }
            className={ `${sliderClass} ${!isPixel
              ? sliderDisabledClass
              : ''}` }
            aria-label="渐变程度"
          />
          <span className={ valueDisplayClass }>{ gradient }</span>
        </div>

        <div className={ sliderContainerClass }>
          <div className={ labelClass }>大小：</div>
          <input
            type="range"
            min="1"
            max="20" // 增大了最大值以观察效果
            step="0.1"
            value={ size }
            onChange={ e => setSize(Number(e.target.value)) }
            disabled={ !isPixel }
            className={ `${sliderClass} ${!isPixel
              ? sliderDisabledClass
              : ''}` }
            aria-label="像素块大小"
          />
          <span className={ valueDisplayClass }>{ size }</span>
        </div>

        <div className={ sliderContainerClass }>
          <div className={ labelClass }>模糊：</div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={ drop }
            onChange={ e => setDrop(Number(e.target.value)) }
            disabled={ !isPixel }
            className={ `${sliderClass} ${!isPixel
              ? sliderDisabledClass
              : ''}` }
            aria-label="背景模糊程度"
          />
          <span className={ valueDisplayClass }>{ drop }</span>
        </div>

        {/* 内容展示区域 */ }
        <div className="mt-8 overflow-hidden border border-gray-200 rounded-lg">
          {/* 为 PixelStyle 的父 div 提供明确的尺寸 */ }
          <div className="mx-auto my-4 h-[200px] w-[300px]">
            <PixelStyle
              isPixelActive={ isPixel }
              gradient={ gradient }
              pixelSize={ size }
              blurDrop={ drop }
            /** 可以传递自定义类名给覆盖层 */
            // pixelOverlayClassName="custom-overlay-class"
            >
              {/* 这里是 children，可以放任何内容 */ }
              <img
                className="h-full w-full object-cover"
                src={ imageUrl }
                alt="示例图片"
              />
              {/* 也可以是其他HTML元素
              <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                <p className="text-white text-xl">一些文本</p>
              </div>
              */}
            </PixelStyle>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PixelTestPage
