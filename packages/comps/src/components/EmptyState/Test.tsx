'use client'

import { EmptyState } from '.'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Message } from '../Message'
import { ThemeToggle } from '../ThemeToggle'

/**
 * EmptyState 组件测试页面
 * - 用于在开发/文档页面中预览不同 props 的渲染效果
 */
function EmptyStateTest() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">EmptyState 组件</h1>
            <p className="mt-1 text-sm text-text2">列表/画布无内容时的友好空状态提示</p>
          </div>
          <ThemeToggle />
        </header>

        <Card title="默认展示（使用内置文案）">
          <div className="h-48">
            <EmptyState />
          </div>
        </Card>

        <Card title="自定义标题/说明">
          <EmptyState
            title="暂无数据"
            description="请前往创建第一个项目以开始使用"
          />
        </Card>

        <Card title="带操作按钮">
          <EmptyState
            title="还没有任务"
            description="创建任务以开始工作流"
            actionLabel="创建任务"
            onAction={ () => Message.success('创建任务 按钮点击') }
          />
        </Card>

        <Card title="辅助操作">
          <Button variant="secondary">
            示例按钮
          </Button>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default EmptyStateTest
