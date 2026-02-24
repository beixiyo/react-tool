'use client'

import { AlignJustify, Layers, Maximize2, Minimize2 } from 'lucide-react'
import { memo, useState } from 'react'
import { TextOverflow } from '.'
import { Button } from '../Button'
import { Card } from '../Card/Card'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'

export default function Test() {
  const [showAllText, setShowAllText] = useState(false)
  const [lines, setLines] = useState(2)

  const longText = '文本溢出是一种常见的UI设计挑战，当文本内容超出其容器的可用空间时，需要一种优雅的方式来处理。本组件提供了一种解决方案，通过在文本末尾添加渐变边界，使文本看起来自然地消失在视图中，而不是突然被截断。这种方法在展示长描述、评论或任何可能超出预定义空间的文本内容时特别有用。用户可以控制显示的行数、行高以及渐变效果，从而实现更加灵活和美观的文本展示效果。'
  const shortText = '这是一段较短的文本，用于展示单行文本溢出效果。这里添加更多文字以确保文本确实会溢出，从而展示渐变边界效果。'

  return (
    <div className="min-h-screen flex flex-col items-center from-background2 to-background3 bg-linear-to-br p-6 dark:from-background dark:to-background2">
      <Card className="max-w-2xl w-full overflow-hidden rounded-xl shadow-xl">
        <div className="flex items-center gap-3 border-b border-border p-6">
          <div className="rounded-lg bg-systemPurple/10 p-2">
            <AlignJustify className="h-5 w-5 text-systemPurple" />
          </div>
          <div>
            <h2 className="text-xl text-text font-bold">文本溢出组件</h2>
            <p className="text-sm text-text2">优雅处理文本溢出的解决方案</p>
          </div>

          <ThemeToggle />
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-text font-medium">
                <Layers className="h-4 w-4" />
                显示行数
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={ () => setLines(Math.max(1, lines - 1)) }
                  leftIcon={ <Minimize2 className="h-3 w-3" /> }
                  disabled={ lines <= 1 }
                >
                  减少
                </Button>
                <span className="w-6 text-center">{ lines }</span>
                <Button
                  size="sm"
                  onClick={ () => setLines(lines + 1) }
                  leftIcon={ <Maximize2 className="h-3 w-3" /> }
                >
                  增加
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-text font-medium">显示全部文本</h3>
              <Switch checked={ showAllText } onChange={ setShowAllText } />
            </div>
          </div>

          <div className="space-y-4">
            <DemoCard title="多行文本溢出并显示省略号" description="长文本内容的溢出处理">
              <div className="relative bg-background">
                <TextOverflow
                  line={ lines }
                  showAllText={ showAllText }
                  fromColor="rgb(var(--background))"
                  lineHeight="1.6rem"
                  GradientBoundaryWidth="6rem"
                  className="pb-6 text-text"
                  mode="ellipsis"
                >
                  { longText }
                </TextOverflow>
              </div>
            </DemoCard>

            <DemoCard title="单行文本溢出" description="单行文本的溢出处理">
              <div className="relative bg-background">
                <TextOverflow
                  line={ 1 }
                  showAllText={ showAllText }
                  fromColor="rgb(var(--background))"
                  GradientBoundaryWidth="8rem"
                  className="pb-6 text-text"
                >
                  { shortText }
                </TextOverflow>
              </div>
            </DemoCard>
          </div>

          <div className="mt-6 border border-warning/20 rounded-lg bg-warningBg/50 p-4">
            <h3 className="mb-2 text-warning font-medium">组件说明</h3>
            <p className="text-sm text-text">
              TextOverflow组件通过在文本末尾添加渐变边界（GradientBoundary），使文本看起来自然消失，而不是突然截断。
              渐变边界的宽度可通过
              <code className="rounded-sm bg-warningBg px-1 py-0.5 text-xs">GradientBoundaryWidth</code>
              属性控制，
              颜色可通过
              <code className="rounded-sm bg-warningBg px-1 py-0.5 text-xs">fromColor</code>
              属性设置。
              在实际应用中，可以结合"展开"按钮，提供更好的用户体验。
            </p>
          </div>

          <div className="border border-info/20 rounded-lg bg-infoBg/50 p-4">
            <h3 className="mb-2 text-info font-medium">深色模式适配</h3>
            <p className="text-sm text-text">
              在深色模式下，需要确保
              <code className="rounded-sm bg-infoBg px-1 py-0.5 text-xs">fromColor</code>
              属性与背景颜色匹配，
              否则渐变效果会不明显。建议在深色模式下使用与背景相匹配的深色颜色作为渐变起始色。
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * 演示卡片组件
 */
const DemoCard = memo(({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <div className="overflow-hidden border border-border rounded-lg">
    <div className="border-b border-border bg-background2 px-4 py-2">
      <h4 className="text-text font-medium">{ title }</h4>
      <p className="text-xs text-text2">{ description }</p>
    </div>
    <div className="p-4">
      { children }
    </div>
  </div>
))

DemoCard.displayName = 'DemoCard'
