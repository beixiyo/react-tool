'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { Tooltip } from './index'

/**
 * Tooltip 组件测试页面
 */
export default function TooltipTest() {
  const [visible, setVisible] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 100, y: 100 })

  return (
    <div className="p-8 space-y-8 dark:bg-black">
      <ThemeToggle></ThemeToggle>
      <h1 className="text-2xl font-bold">Tooltip 组件测试</h1>

      {/* 基础 Tooltip */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">基础 Tooltip</h2>
        <div className="flex gap-4">
          <Tooltip content="这是一个基础的 Tooltip">
            <Button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              悬停显示 Tooltip
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 不同位置 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">不同位置</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Tooltip content="左侧 Tooltip" placement="left">
            <Button className="w-full rounded-sm bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              左侧
            </Button>
          </Tooltip>

          <Tooltip content="顶部 Tooltip" placement="top">
            <Button className="w-full rounded-sm bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              顶部
            </Button>
          </Tooltip>

          <Tooltip content="底部 Tooltip" placement="bottom">
            <Button className="w-full rounded-sm bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              底部
            </Button>
          </Tooltip>

          <Tooltip content="右侧 Tooltip" placement="right">
            <Button className="w-full rounded-sm bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              右侧
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 不同触发方式 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">不同触发方式</h2>
        <div className="flex gap-4">
          <Tooltip content="悬停触发" trigger="hover">
            <Button className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
              悬停触发
            </Button>
          </Tooltip>

          <Tooltip content="点击触发" trigger="click">
            <Button className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
              点击触发
            </Button>
          </Tooltip>

          <Tooltip content="焦点触发" trigger="focus">
            <Button className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
              焦点触发
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 格式化内容 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">格式化内容</h2>
        <div className="flex gap-4">
          <Tooltip
            content={ 85 }
            formatter={ value => `${value}%` }
          >
            <Button className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
              格式化数字
            </Button>
          </Tooltip>

          <Tooltip
            content={ <div className="text-center">
              <div className="font-bold">自定义内容</div>
              <div className="text-xs">支持 JSX</div>
            </div> }
          >
            <Button className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
              自定义内容
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 受控模式 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">受控模式</h2>
        <div className="flex gap-4">
          <Tooltip
            content="受控显示的 Tooltip"
            visible={ visible }
          >
            <Button className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
              受控 Tooltip
            </Button>
          </Tooltip>

          <Button
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={ () => setVisible(!visible) }
          >
            { visible
              ? '隐藏'
              : '显示' }
            { ' ' }
            Tooltip
          </Button>
        </div>
      </div>

      {/* 禁用状态 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">禁用状态</h2>
        <div className="flex gap-4">
          <Tooltip content="这个不会显示" disabled>
            <Button className="cursor-not-allowed rounded-sm bg-gray-400 px-4 py-2 text-white">
              禁用的 Tooltip
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 延迟显示 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">延迟显示</h2>
        <div className="flex gap-4">
          <Tooltip content="延迟 500ms 显示" delay={ 500 }>
            <Button className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
              延迟显示
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 边界测试 */ }
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">边界测试</h2>
        <div className="flex justify-between">
          <Tooltip content="左边界测试 - 应该自动调整位置" placement="left">
            <Button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
              左边界
            </Button>
          </Tooltip>

          <Tooltip content="右边界测试 - 应该自动调整位置" placement="right">
            <Button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
              右边界
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl text-gray-900 font-bold dark:text-gray-100">
            Tooltip autoHideOnResize 功能测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            测试 Tooltip 组件的 autoHideOnResize 属性在元素位置/尺寸变化时的自动隐藏功能
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 测试区域 1：尺寸变化 */ }
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
            <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
              测试 1：尺寸变化
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              点击按钮改变容器尺寸，观察 Tooltip 是否自动隐藏
            </p>

            <motion.div
              className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20"
              animate={ {
                width: isExpanded
                  ? 300
                  : 200,
                height: isExpanded
                  ? 150
                  : 100,
              } }
              transition={ { duration: 0.3 } }
            >
              <div className="h-full flex items-center justify-center">
                <Tooltip content="这是一个测试 Tooltip" autoHideOnResize>
                  <button
                    onClick={ () => setIsExpanded(!isExpanded) }
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    { isExpanded
                      ? '收缩容器'
                      : '展开容器' }
                  </button>
                </Tooltip>
              </div>
            </motion.div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              当前尺寸:
              { ' ' }
              { isExpanded
                ? '300x150'
                : '200x100' }
              px
            </div>
          </div>

          {/* 测试区域 2：位置变化 */ }
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
            <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
              测试 2：位置变化
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              点击按钮改变元素位置，观察 Tooltip 是否自动隐藏
            </p>

            <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-700">
              <div
                className="absolute"
                style={ {
                  left: position.x,
                  top: position.y,
                  transition: '0.1s',
                } }
              >
                <Tooltip content="位置会改变的按钮" autoHideOnResize>
                  <button
                    onClick={ () => setPosition({
                      x: Math.random() * 200,
                      y: Math.random() * 150,
                    }) }
                    className="rounded-md bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700"
                  >
                    移动位置
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              当前位置: (
              { Math.round(position.x) }
              ,
              { ' ' }
              { Math.round(position.y) }
              )px
            </div>
          </div>
        </div>

        {/* 说明文档 */ }
        <div className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h3 className="mb-3 text-blue-800 font-medium dark:text-blue-200">
            📖 使用说明
          </h3>
          <div className="text-sm text-blue-700 space-y-2 dark:text-blue-300">
            <p>
              <strong>autoHideOnResize 属性：</strong>
              当设置为 true 时，Tooltip 会自动监听触发元素的尺寸和位置变化
            </p>
            <p>
              <strong>工作原理：</strong>
              内部使用 ResizeObserver API 监听元素变化，检测到变化时自动隐藏 Tooltip
            </p>
            <p>
              <strong>适用场景：</strong>
              动画组件、可折叠面板、拖拽元素、响应式布局等会改变元素位置的场景
            </p>
            <p>
              <strong>性能优化：</strong>
              只有在 autoHideOnResize=true 时才启用监听，避免不必要的性能开销
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
