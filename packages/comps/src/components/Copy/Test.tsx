'use client'

import { Copy } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function CopyDemo() {
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
                <Copy text="小尺寸" buttonProps={ { size: 'sm' } } />
                <Copy text="中等尺寸" buttonProps={ { size: 'md' } } />
                <Copy text="大尺寸" buttonProps={ { size: 'lg' } } />
              </div>
            </div>

            <div className="rounded-lg bg-background p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">带文本的尺寸</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Copy
                  text="小尺寸"
                  showText
                  buttonText="复制"
                  buttonProps={ { size: 'sm' } }
                />
                <Copy
                  text="中等尺寸"
                  showText
                  buttonText="复制"
                  buttonProps={ { size: 'md' } }
                />
                <Copy
                  text="大尺寸"
                  showText
                  buttonText="复制"
                  buttonProps={ { size: 'lg' } }
                />
              </div>
            </div>
          </div>
        </section>

        {/* 不同变体 */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">不同变体</h2>

          <div className="rounded-lg bg-background p-6 shadow-xs">
            <h3 className="mb-4 text-lg font-medium">按钮变体</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Copy
                text="默认变体"
                buttonProps={ { variant: 'default' } }
              />
              <Copy
                text="主要变体"
                buttonProps={ { variant: 'primary' } }
              />
              <Copy
                text="成功变体"
                buttonProps={ { variant: 'success' } }
              />
              <Copy
                text="警告变体"
                buttonProps={ { variant: 'warning' } }
              />
              <Copy
                text="危险变体"
                buttonProps={ { variant: 'danger' } }
              />
              <Copy
                text="信息变体"
                buttonProps={ { variant: 'info' } }
              />
              <Copy
                text="幽灵变体"
                buttonProps={ { variant: 'ghost' } }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
