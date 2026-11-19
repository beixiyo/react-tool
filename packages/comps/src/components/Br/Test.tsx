'use client'

import { Badge } from '../Badge'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { Br } from '.'

/** 调整浏览器宽度跨过 md 断点（768px）即可观察不同视口下的断行位置 */
function BrTest() {
  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="Br 响应式换行"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-text2 text-sm">
          拖动窗口宽度跨过 md 断点（768px），观察每段文案的断行位置变化
        </p>

        <Card title="普通 <Br />：所有视口都换行" variant="glass" padding="lg">
          <p className="text-xl font-semibold">
            Premium quality
            <Br />
            for everyday comfort
          </p>
        </Card>

        <Card title="<Br mobile />：仅移动端（< md）换行" variant="glass" padding="lg">
          <p className="text-xl font-semibold">
            Premium quality
            <Br mobile /> for everyday comfort
          </p>
        </Card>

        <Card title="<Br desktop />：仅桌面端（>= md）换行" variant="glass" padding="lg">
          <p className="text-xl font-semibold">
            Premium quality
            <Br desktop /> for everyday comfort
          </p>
        </Card>

        <Card title="组合：移动端与桌面端分行点不同" variant="glass" padding="lg">
          <p className="text-xl font-semibold">
            Design once,
            <Br mobile /> ship everywhere,
            <Br desktop /> adapt to every screen
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">brM：移动端断在 “Design once,” 之后</Badge>
            <Badge variant="secondary">brD：桌面端断在 “ship everywhere,” 之后</Badge>
          </div>
        </Card>
      </div>
    </Card>
  )
}

export default BrTest
