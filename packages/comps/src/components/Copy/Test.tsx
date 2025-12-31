'use client'

import { Message } from '../Message'
import { Copy } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function CopyDemo() {
  const handleCopySuccess = (text: string) => {
    Message.success(`已复制: ${text}`)
  }

  const handleCopyError = (error: Error) => {
    Message.error(`复制失败: ${error.message}`)
  }

  return (
    <div className="h-screen overflow-auto bg-backgroundSecondary p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="mb-8 w-fit text-3xl font-bold">Copy 组件展示</h1>
          <ThemeToggle />
        </div>

        {/* 基础用法 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">基础用法</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">仅图标按钮</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy text="这是要复制的内容" />
                <Copy text="https://example.com" />
                <Copy text="复制这段文本" />
              </div>
              <p className="mt-4 text-sm text-textSecondary">
                点击按钮后，会复制内容到剪贴板，然后显示 Checkmark 动画
              </p>
            </div>

            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">带文本按钮</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy text="这是要复制的内容" showText buttonText="复制" />
                <Copy
                  text="https://example.com"
                  showText
                  buttonText="复制链接"
                />
                <Copy
                  text="复制这段文本"
                  showText
                  buttonText="复制文本"
                />
              </div>
              <p className="mt-4 text-sm text-textSecondary">
                通过 showText 属性显示按钮文本
              </p>
            </div>
          </div>
        </section>

        {/* 不同尺寸 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">不同尺寸</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">尺寸变体</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy text="小尺寸" buttonProps={{ size: 'sm' }} />
                <Copy text="中等尺寸" buttonProps={{ size: 'md' }} />
                <Copy text="大尺寸" buttonProps={{ size: 'lg' }} />
              </div>
            </div>

            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">带文本的尺寸</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="小尺寸"
                  showText
                  buttonText="复制"
                  buttonProps={{ size: 'sm' }}
                />
                <Copy
                  text="中等尺寸"
                  showText
                  buttonText="复制"
                  buttonProps={{ size: 'md' }}
                />
                <Copy
                  text="大尺寸"
                  showText
                  buttonText="复制"
                  buttonProps={{ size: 'lg' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 不同变体 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">不同变体</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">按钮变体</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="默认变体"
                  buttonProps={{ variant: 'default' }}
                />
                <Copy
                  text="主要变体"
                  buttonProps={{ variant: 'primary' }}
                />
                <Copy
                  text="成功变体"
                  buttonProps={{ variant: 'success' }}
                />
                <Copy
                  text="警告变体"
                  buttonProps={{ variant: 'warning' }}
                />
                <Copy
                  text="危险变体"
                  buttonProps={{ variant: 'danger' }}
                />
                <Copy
                  text="信息变体"
                  buttonProps={{ variant: 'info' }}
                />
                <Copy
                  text="幽灵变体"
                  buttonProps={{ variant: 'ghost' }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">带文本的变体</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="主要按钮"
                  showText
                  buttonText="复制"
                  buttonProps={{ variant: 'primary' }}
                />
                <Copy
                  text="成功按钮"
                  showText
                  buttonText="复制"
                  buttonProps={{ variant: 'success' }}
                />
                <Copy
                  text="幽灵按钮"
                  showText
                  buttonText="复制"
                  buttonProps={{ variant: 'ghost' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 自定义动画 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">自定义动画参数</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">动画时长</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="快速动画"
                  animationDuration={0.3}
                  resetDelay={1000}
                />
                <Copy
                  text="默认动画"
                  animationDuration={0.6}
                  resetDelay={1500}
                />
                <Copy
                  text="慢速动画"
                  animationDuration={1.2}
                  resetDelay={2500}
                />
              </div>
              <p className="mt-4 text-sm text-textSecondary">
                可以自定义动画持续时间和重置延迟
              </p>
            </div>

            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">自定义 Checkmark 样式</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="绿色 Checkmark"
                  checkmarkProps={{
                    borderColor: 'rgb(var(--systemGreen) / 1)',
                    checkmarkColor: 'rgb(var(--systemGreen) / 1)',
                  }}
                />
                <Copy
                  text="蓝色 Checkmark"
                  checkmarkProps={{
                    borderColor: 'rgb(var(--systemBlue) / 1)',
                    checkmarkColor: 'rgb(var(--systemBlue) / 1)',
                  }}
                />
                <Copy
                  text="橙色 Checkmark"
                  checkmarkProps={{
                    borderColor: 'rgb(var(--systemOrange) / 1)',
                    checkmarkColor: 'rgb(var(--systemOrange) / 1)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 回调函数 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">回调函数</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">成功回调</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="复制成功会显示提示"
                  onCopy={handleCopySuccess}
                  showText
                  buttonText="复制"
                />
              </div>
              <p className="mt-4 text-sm text-textSecondary">
                点击后会在控制台输出和显示成功消息
              </p>
            </div>

            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">错误回调</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="测试错误处理"
                  onCopyError={handleCopyError}
                  showText
                  buttonText="复制"
                />
              </div>
              <p className="mt-4 text-sm text-textSecondary">
                如果复制失败会触发错误回调
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

