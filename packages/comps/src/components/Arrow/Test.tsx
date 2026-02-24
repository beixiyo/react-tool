'use client'

import type { ArrowDirection } from '.'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Arrow } from '.'
import { Slider } from '../Slider'
import { ThemeToggle } from '../ThemeToggle'

export default function Test() {
  const [size, setSize] = useState(14)
  const [thickness, setThickness] = useState(2)
  const [rotate, setRotate] = useState(0)
  const [color, setColor] = useState('#4f46e5')
  const [selectedDirection, setSelectedDirection] = useState<ArrowDirection | undefined>(undefined)

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
            Arrow 组件测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            一个简单而灵活的箭头组件，可自定义方向、大小、颜色和粗细
          </p>
        </motion.div>

        {/* 交互控制区 */}
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
                大小 (size):
                {' '}
                {size}
                px
              </label>
              <Slider
                min={ 4 }
                max={ 24 }
                value={ size }
                onChange={ value => setSize(value as number) }
                tooltip
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-700 font-medium dark:text-gray-300">
                粗细 (thickness):
                {' '}
                {thickness}
                px
              </label>
              <Slider
                min={ 1 }
                max={ 5 }
                value={ thickness }
                onChange={ value => setThickness(value as number) }
                tooltip
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-700 font-medium dark:text-gray-300">
                旋转角度 (rotate):
                {' '}
                {rotate}
                °
                {selectedDirection && <span className="ml-2 text-xs text-amber-500">(被direction属性覆盖)</span>}
              </label>
              <Slider
                min={ 0 }
                max={ 360 }
                value={ rotate }
                onChange={ value => setRotate(value as number) }
                tooltip
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-700 font-medium dark:text-gray-300">
                颜色 (color):
              </label>
              <input
                type="color"
                value={ color }
                onChange={ e => setColor(e.target.value) }
                className="h-10 w-full cursor-pointer rounded-xs"
              />
            </div>
          </div>

          {/* 方向选择器 */}
          <div className="mt-6">
            <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
              方向 (direction):
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: undefined, label: '无 (使用rotate)' },
                { value: 'up', label: '向上 (up)' },
                { value: 'right', label: '向右 (right)' },
                { value: 'down', label: '向下 (down)' },
                { value: 'left', label: '向左 (left)' },
              ].map(option => (
                <motion.button
                  key={ option.value || 'none' }
                  className={ `px-3 py-1.5 rounded-md text-sm ${
                    selectedDirection === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }` }
                  onClick={ () => setSelectedDirection(option.value as any) }
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.95 } }
                >
                  {option.label}
                </motion.button>
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

          <div className="flex items-center justify-center rounded-lg bg-gray-100 p-10 dark:bg-gray-700">
            <motion.div
              animate={ selectedDirection
                ? {}
                : { rotate } }
              transition={ { type: 'spring', stiffness: 100 } }
            >
              <Arrow
                size={ size }
                thickness={ thickness }
                color={ color }
                rotate={ rotate }
                direction={ selectedDirection }
              />
            </motion.div>
          </div>
        </motion.div>

        {/* 方向示例 */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.3 } }
        >
          <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-gray-200">
            方向属性示例
          </h2>

          <div className="grid grid-cols-2 gap-8 p-4 md:grid-cols-4">
            {[
              { direction: 'up' as const, label: '向上 (up)' },
              { direction: 'right' as const, label: '向右 (right)' },
              { direction: 'down' as const, label: '向下 (down)' },
              { direction: 'left' as const, label: '向左 (left)' },
            ].map((item, index) => (
              <motion.div
                key={ index }
                className="flex flex-col items-center space-y-2"
                initial={ { opacity: 0, y: 20 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { delay: 0.1 * index, duration: 0.5 } }
                whileHover={ { scale: 1.05 } }
              >
                <div className="h-16 flex items-center justify-center">
                  <motion.div whileHover={ { scale: 1.2 } }>
                    <Arrow direction={ item.direction } size={ 8 } thickness={ 2 } color={ color } />
                  </motion.div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 使用说明 */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.4 } }
        >
          <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-gray-200">
            使用说明
          </h2>

          <div className="text-gray-700 space-y-4 dark:text-gray-300">
            <p>
              Arrow 组件是一个简单的箭头 UI 元素，使用 CSS 边框实现，具有良好的可定制性。
            </p>

            <div className="space-y-2">
              <h3 className="font-medium">参数说明：</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">size</code>
                  : 箭头大小，单位为像素（默认值: 6）
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">thickness</code>
                  : 箭头线条粗细，单位为像素（默认值: 1）
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">rotate</code>
                  : 旋转角度，单位为度（默认值: 0）
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">direction</code>
                  : 箭头方向，可选值为 'up'|'right'|'down'|'left'，优先级高于rotate属性
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">color</code>
                  : 箭头颜色（默认值: black）
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">className</code>
                  : 自定义类名
                </li>
                <li>
                  <code className="rounded-sm bg-gray-100 px-1 dark:bg-gray-700">style</code>
                  : 自定义样式对象
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
                  {`import { Arrow } from '@/components/Arrow'

// 基本用法
<Arrow />

// 使用rotate属性
<Arrow
  size={10}
  thickness={2}
  rotate={90}
  color="#4f46e5"
/>

// 使用direction属性（优先级高于rotate）
<Arrow
  size={10}
  thickness={2}
  direction="right"
  color="#4f46e5"
/>`}
                </code>
              </motion.pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
