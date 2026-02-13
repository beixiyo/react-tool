'use client'

import { EmptyState } from '.'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'

/**
 * EmptyState 组件测试页面
 * - 用于在开发/文档页面中预览不同 props 的渲染效果
 */
export default function EmptyStateTest() {
  return (
    <div className="p-8 space-y-8 dark:bg-black">
      <ThemeToggle></ThemeToggle>

      <h1 className="text-2xl font-bold">EmptyState 组件测试</h1>

      <div className="space-y-6">
        <div className="rounded-lg p-6 shadow-lg bg-background2">
          <h2 className="mb-3 text-lg font-medium">默认展示（使用内置文案）</h2>
          <div className="h-48">
            <EmptyState />
          </div>
        </div>

        <div className="rounded-lg p-6 shadow-lg bg-background2">
          <h2 className="mb-3 text-lg font-medium">自定义标题/说明</h2>
          <EmptyState
            title="暂无数据"
            description="请前往创建第一个项目以开始使用"
          />
        </div>

        <div className="rounded-lg p-6 shadow-lg bg-background2">
          <h2 className="mb-3 text-lg font-medium">带操作按钮</h2>
          <EmptyState
            title="还没有任务"
            description="创建任务以开始工作流"
            actionLabel="创建任务"
            onAction={ () => {
              /** 用于本地测试时快速反馈 */
              // @TODO: 集成实际路由或回调

              alert('创建任务 按钮点击')
            } }
          />
        </div>

        <div className="flex gap-4">
          <Button className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
            示例按钮
          </Button>
        </div>
      </div>
    </div>
  )
}
