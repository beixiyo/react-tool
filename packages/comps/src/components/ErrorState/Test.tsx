'use client'

import { ErrorState } from '.'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'

/**
 * ErrorState 组件测试页面
 * - 演示错误信息和重试回调
 */
export default function ErrorStateTest() {
  return (
    <div className="p-8 space-y-8 dark:bg-black">
      <ThemeToggle></ThemeToggle>

      <h1 className="text-2xl font-bold">ErrorState 组件测试</h1>

      <div className="space-y-6">
        <div className="rounded-lg p-6 shadow-lg bg-background2">
          <h2 className="mb-3 text-lg font-medium">默认错误提示（内置文案）</h2>
          <div className="h-48">
            <ErrorState />
          </div>
        </div>

        <div className="rounded-lg p-6 shadow-lg bg-background2">
          <h2 className="mb-3 text-lg font-medium">自定义错误信息与重试</h2>
          <ErrorState
            message="加载失败，请检查网络连接"
            onRetry={ () => {
              /** 用于本地测试时快速反馈 */
              // @TODO: 替换为实际请求重试逻辑

              alert('重试 点击')
            } }
          />
        </div>

        <div className="flex gap-4">
          <Button className="rounded-sm bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            辅助操作
          </Button>
        </div>
      </div>
    </div>
  )
}
