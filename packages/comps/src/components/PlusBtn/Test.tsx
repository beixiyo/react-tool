'use client'

import { useState } from 'react'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { PlusBtn } from '.'

const SIZES = ['sm', 'md', 'lg', 'xl', 36] as const
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

function PlusBtnTest() {
  const [count, setCount] = useState(0)

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="PlusBtn 加号按钮"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card title="尺寸 size（static 布局）" variant="glass" padding="lg">
          <div className="flex flex-wrap items-center gap-6">
            { SIZES.map((size) => (
              <div key={ size } className="flex flex-col items-center gap-2">
                <PlusBtn mode="static" size={ size } aria-label={ `Add (${size})` } />
                <Badge variant="outline">{ String(size) }</Badge>
              </div>
            )) }
          </div>
        </Card>

        <Card title="变体 variant" variant="glass" padding="lg">
          <div className="flex flex-wrap items-center gap-6">
            <PlusBtn mode="static" variant="default" />
            <PlusBtn mode="static" variant="filled" />
            <PlusBtn mode="static" variant="filled" size="lg" />
            <PlusBtn mode="static" disabled className="cursor-not-allowed opacity-40" />
          </div>
        </Card>

        <Card title="点击回调" variant="glass" padding="lg">
          <div className="flex items-center gap-4">
            <PlusBtn mode="static" variant="filled" onClick={ () => setCount((c) => c + 1) } />
            <Badge>{ `已点击 ${count} 次` }</Badge>
            <Button size="sm" variant="ghost" onClick={ () => setCount(0) }>重置</Button>
          </div>
        </Card>

        <Card title="absolute 定位 corner" variant="glass" padding="lg">
          <div className="grid grid-cols-2 gap-4">
            { CORNERS.map((corner) => (
              <div
                key={ corner }
                className="border-border bg-background2 text-text2 relative flex h-24 items-center justify-center rounded-xl border text-sm"
              >
                { corner }
                <PlusBtn corner={ corner } size="sm" />
              </div>
            )) }
          </div>
        </Card>
      </div>
    </Card>
  )
}

export default PlusBtnTest
