'use client'

import { Heart, Settings, Star } from 'lucide-react'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { Icon } from '.'

/** 内联 SVG 作为 `src` 演示图片模式，避免依赖外部资源 */
const SVG_SRC = `data:image/svg+xml;utf8,${
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>',
  )
}`

/**
 * Icon 已标记 deprecated：新代码直接使用 lucide 组件，
 * 此页仅用于回归已有调用方的渲染形态
 */
function IconTest() {
  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="Icon（deprecated）"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-text2 text-sm">
          已弃用：新代码请直接使用 lucide-react 组件，本页仅用于回归已有调用方
        </p>

        <Card title="icon：lucide 组件（默认带圆形容器）" variant="glass" padding="lg">
          <div className="flex flex-wrap items-center gap-4">
            <Icon icon={ Heart } />
            <Icon icon={ Star } size={ 18 } />
            <Icon icon={ Settings } size={ 20 } className="size-10" />
          </div>
        </Card>

        <Card title="src：图片模式" variant="glass" padding="lg">
          <div className="flex flex-wrap items-center gap-4">
            <Icon src={ SVG_SRC } size={ 16 } />
            <Icon src={ SVG_SRC } width={ 20 } height={ 20 } className="size-10" />
          </div>
        </Card>

        <Card title="needContainer=false：只渲染图标本体" variant="glass" padding="lg">
          <div className="text-text flex flex-wrap items-center gap-4">
            <Icon icon={ Heart } needContainer={ false } iconClass="text-text" size={ 20 } />
            <Icon icon={ Star } needContainer={ false } iconClass="text-text2" size={ 24 } />
          </div>
        </Card>

        <Card title="asChild：容器样式合并到子元素" variant="glass" padding="lg">
          <Icon asChild className="size-auto rounded-lg px-3 py-1.5 text-sm">
            <button type="button">作为按钮渲染</button>
          </Icon>
        </Card>
      </div>
    </Card>
  )
}

export default IconTest
