'use client'

import { useRef, useState } from 'react'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { Slot } from '.'

function SlotTest() {
  const [clicks, setClicks] = useState(0)
  const [refTag, setRefTag] = useState('')
  const linkRef = useRef<HTMLElement>(null)

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="Slot 属性透传"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-text2 text-sm">
          Slot 不渲染额外 DOM，把自身属性合并到唯一子元素上：className 拼接、style 浅合并（子元素同名样式优先），其余属性由 Slot 覆盖
        </p>

        <Card title="className 合并" variant="glass" padding="lg">
          <Slot className="border-border rounded-full border px-4 py-2 text-sm">
            <span className="bg-background2 text-text">父级提供形状，子级提供配色</span>
          </Slot>
        </Card>

        <Card title="style 合并（子元素优先）" variant="glass" padding="lg">
          <Slot style={ { padding: 12, borderRadius: 12, opacity: 0.5 } }>
            <div className="border-border bg-background2 text-text border text-sm" style={ { opacity: 1 } }>
              padding / borderRadius 来自 Slot，opacity 被子元素覆盖为 1
            </div>
          </Slot>
        </Card>

        <Card title="事件透传" variant="glass" padding="lg">
          <div className="flex items-center gap-4">
            <Slot onClick={ () => setClicks((c) => c + 1) }>
              <Button variant="primary">点我（onClick 来自 Slot）</Button>
            </Slot>
            <Badge>{ `点击 ${clicks} 次` }</Badge>
          </div>
        </Card>

        <Card title="ref 透传" variant="glass" padding="lg">
          <div className="flex items-center gap-4">
            <Slot ref={ linkRef } className="text-info text-sm underline">
              <a href="#slot-ref">被 Slot 包裹的链接</a>
            </Slot>
            <Button size="sm" onClick={ () => setRefTag(linkRef.current?.tagName ?? '') }>
              读取 ref.tagName
            </Button>
            { refTag && <Badge variant="outline">{ refTag }</Badge> }
          </div>
        </Card>

        <Card title="约束" variant="glass" padding="lg">
          <p className="text-text2 text-sm">
            子节点必须恰好是一个有效 React 元素，否则抛出错误 “Slot must have exactly one valid child element”
          </p>
        </Card>
      </div>
    </Card>
  )
}

export default SlotTest
