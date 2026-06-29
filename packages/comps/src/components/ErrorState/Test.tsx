'use client'

import { ErrorState } from '.'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Message } from '../Message'
import { ThemeToggle } from '../ThemeToggle'

/**
 * ErrorState 组件测试页面
 * - 演示错误信息和重试回调
 */
function ErrorStateTest() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ErrorState 组件</h1>
            <p className="mt-1 text-sm text-text2">展示错误信息并提供重试入口</p>
          </div>
          <ThemeToggle />
        </header>

        <Card title="默认错误提示（内置文案）">
          <div className="h-48">
            <ErrorState />
          </div>
        </Card>

        <Card title="自定义错误信息与重试">
          <ErrorState
            message="加载失败，请检查网络连接"
            onRetry={ () => Message.info('重试 点击') }
          />
        </Card>

        <Card title="辅助操作">
          <Button variant="danger">
            辅助操作
          </Button>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default ErrorStateTest
