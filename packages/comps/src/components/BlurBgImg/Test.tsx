'use client'

import { IMG_URLS } from 'config'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { BlurBgImg } from '.'
import { Checkbox } from '../Checkbox/Checkbox'
import { Slider } from '../Slider'
import { ThemeToggle } from '../ThemeToggle'

export default function Test() {
  const [blur, setBlur] = useState(15)
  const [showContent, setShowContent] = useState(false)
  const [selectedImage, setSelectedImage] = useState(IMG_URLS[0])

  /** 将数值转换为CSS blur值 */
  const blurValue = `${blur}px`

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div
          className="text-center"
          initial={ { opacity: 0, y: -20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <h1 className="mb-2 text-3xl text-gray-900 font-bold dark:text-gray-100">
            BlurBgImg 组件测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            一个带模糊背景的图片展示组件，可用于创建毛玻璃效果
          </p>
        </motion.div>

        {/* 控制面板 */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-xs space-y-4 dark:bg-gray-800"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.1 } }
        >
          <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-gray-200">
            参数控制
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm text-gray-700 font-medium dark:text-gray-300">
                模糊程度 (blur):
                {' '}
                {blur}
                px
              </label>
              <motion.div
                whileTap={ { scale: 1.02 } }
                transition={ { type: 'spring', stiffness: 300 } }
              >
                <Slider
                  min={ 0 }
                  max={ 50 }
                  step={ 1 }
                  value={ blur }
                  onChange={ value => setBlur(value as number) }
                  tooltip
                />
              </motion.div>
            </div>

            <div className="space-y-2">
              <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                展示方式
              </label>
              <Checkbox
                checked={ showContent }
                onChange={ setShowContent }
                label="显示自定义内容"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700 font-medium dark:text-gray-300">
              选择图片
            </label>
            <div className="grid grid-cols-3 gap-2">
              {IMG_URLS.map((img, index) => (
                <motion.div
                  key={ index }
                  className={ `cursor-pointer border-2 rounded overflow-hidden ${
                    selectedImage === img
                      ? 'border-blue-500'
                      : 'border-transparent'
                  }` }
                  onClick={ () => setSelectedImage(img) }
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.98 } }
                  transition={ { type: 'spring', stiffness: 400, damping: 17 } }
                >
                  <img src={ img } alt={ `Sample ${index + 1}` } className="h-20 w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 预览区 */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.2 } }
        >
          <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-gray-200">
            预览
          </h2>

          <motion.div
            className="h-80 overflow-hidden rounded-lg"
            layoutId="preview-container"
          >
            <BlurBgImg
              img={ selectedImage }
              blur={ blurValue }
              className="h-full w-full"
            >
              <AnimatePresence mode="wait">
                {showContent
                  ? (
                      <motion.div
                        key="custom-content"
                        className="rounded-lg bg-white/30 p-6 text-center shadow-lg backdrop-blur-xs"
                        initial={ { opacity: 0, scale: 0.8 } }
                        animate={ { opacity: 1, scale: 1 } }
                        exit={ { opacity: 0, scale: 0.8 } }
                        transition={ { type: 'spring', stiffness: 300, damping: 25 } }
                      >
                        <motion.h3
                          className="mb-2 text-2xl text-white font-bold"
                          initial={ { y: -20, opacity: 0 } }
                          animate={ { y: 0, opacity: 1 } }
                          transition={ { delay: 0.1 } }
                        >
                          自定义内容
                        </motion.h3>
                        <motion.p
                          className="text-white/90"
                          initial={ { y: -10, opacity: 0 } }
                          animate={ { y: 0, opacity: 1 } }
                          transition={ { delay: 0.2 } }
                        >
                          您可以在模糊背景上添加任何自定义内容，如文本、按钮或其他组件
                        </motion.p>
                        <motion.button
                          className="mt-4 rounded-md bg-white px-4 py-2 text-gray-900 transition-colors hover:bg-gray-100"
                          initial={ { y: 20, opacity: 0 } }
                          animate={ { y: 0, opacity: 1 } }
                          transition={ { delay: 0.3 } }
                          whileHover={ { scale: 1.05 } }
                          whileTap={ { scale: 0.95 } }
                        >
                          示例按钮
                        </motion.button>
                      </motion.div>
                    )
                  : (
                      <motion.div
                        key="empty-content"
                        className="h-full w-full"
                        initial={ { opacity: 0 } }
                        animate={ { opacity: 1 } }
                        exit={ { opacity: 0 } }
                      />
                    )}
              </AnimatePresence>
            </BlurBgImg>
          </motion.div>
        </motion.div>

        {/* 使用说明 */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.3 } }
        >
          <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-gray-200">
            使用说明
          </h2>

          <div className="text-gray-700 space-y-4 dark:text-gray-300">
            <p>
              BlurBgImg 组件创建一个带有模糊背景的图片容器，适合用于创建毛玻璃效果或强调前景内容。
            </p>

            <div className="space-y-2">
              <h3 className="font-medium">参数说明：</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">img</code>
                  : 图片URL（必填）
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">blur</code>
                  : 背景模糊程度，CSS blur值（默认: '15px'）
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">className</code>
                  : 容器自定义类名
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">imgClassName</code>
                  : 内部图片容器的自定义类名
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">style</code>
                  : 自定义样式对象
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">children</code>
                  : 自定义内容（如果提供，则不会显示原图）
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">使用示例：</h3>
              <motion.pre
                className="overflow-x-auto rounded-xs bg-gray-100 p-3 dark:bg-gray-700"
                whileHover={ { scale: 1.01 } }
                transition={ { type: 'spring', stiffness: 400, damping: 10 } }
              >
                <code>
                  {`import { BlurBgImg } from '@/components/BlurBgImg'

// 基本用法 - 显示原图及其模糊背景
<BlurBgImg
  img="path/to/image.jpg"
  blur="15px"
  className="w-full h-64"
/>

// 高级用法 - 自定义内容
<BlurBgImg
  img="path/to/image.jpg"
  blur="20px"
  className="w-full h-64"
>
  <div className="text-center text-white">
    <h2>自定义内容</h2>
    <button>点击按钮</button>
  </div>
</BlurBgImg>`}
                </code>
              </motion.pre>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              注意：组件内部使用了相对定位和z-index来确保内容在模糊背景之上。
              背景图片会被放大到125%以确保在模糊后边缘不会出现空白。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
