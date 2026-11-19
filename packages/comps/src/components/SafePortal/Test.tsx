'use client'

import { useState } from 'react'
import { Badge } from '../Badge'
import { Card } from '../Card'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { SafePortal } from '.'

function SafePortalTest() {
  const [showBody, setShowBody] = useState(false)
  const [showTarget, setShowTarget] = useState(true)
  const [target, setTarget] = useState<HTMLDivElement | null>(null)

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="SafePortal 安全传送门"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-text2 text-sm">
          挂载后才渲染 Portal，SSR 阶段输出为空，避免访问 document 与水合不一致
        </p>

        <Card title="默认目标：document.body" variant="glass" padding="lg">
          <Switch checked={ showBody } onChange={ setShowBody } label="渲染到 body（右下角浮层）" />
          { showBody && (
            <SafePortal>
              <div className="border-border bg-background text-text fixed right-6 bottom-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg">
                我被传送到了 document.body
              </div>
            </SafePortal>
          ) }
        </Card>

        <Card title="自定义 target" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Switch checked={ showTarget } onChange={ setShowTarget } label="渲染到下方容器" />
          <div
            ref={ setTarget }
            className="border-border min-h-20 rounded-xl border border-dashed p-4"
          >
            <Badge variant="outline">target 容器</Badge>
          </div>
          { showTarget && (
            <SafePortal target={ target }>
              <div className="bg-background2 text-text mt-3 rounded-lg px-3 py-2 text-sm">
                Portal 内容（声明位置在容器之后，渲染在容器内）
              </div>
            </SafePortal>
          ) }
        </Card>

        <Card title="target 为 null：回退到 body" variant="glass" padding="lg">
          <p className="text-text2 text-sm">
            传入 null / undefined 时与默认行为一致，挂载后传送到 document.body
          </p>
        </Card>
      </div>
    </Card>
  )
}

export default SafePortalTest
