'use client'

import { useInsertStyle } from 'hooks'
import { memo, useEffect, useState } from 'react'
import { cn, mdToHTML } from 'utils'
import { MdToHtml } from '../MdEditor/MdToHtml'
import { VirtualDyScroll } from '../VirtualDyScroll'

export const VirtualizedMarkdown = memo<VirtualizedMarkdownProps>(({
  content,
  className,
  style,
  itemHeight = 40,
  overscan = 10,
}) => {
  const [blocks, setBlocks] = useState<MarkdownBlock[]>([])
  const [loading, setLoading] = useState(true)

  useInsertStyle(new URL('styles/css/github-markdown.css', import.meta.url).href)

  /** 将Markdown内容分割成块 */
  useEffect(() => {
    const splitMarkdown = async () => {
      setLoading(true)

      /**
       * 按段落分割Markdown
       * 这里使用正则表达式匹配不同类型的Markdown块
       * 如标题、段落、代码块、列表等
       */
      const blockRegex = /(#{1,6} .+)|(`{3}[\s\S]+?`{3})|((?:[*+-]|\d+\.)\s+.+(?:\n\s+.+)*)|((?:.+\n?)+)/g
      const matches = content.match(blockRegex) || []

      /** 为每个块生成唯一ID和HTML内容 */
      const processedBlocks = await Promise.all(
        matches
          .filter(block => block.trim() !== '')
          .map(async (block, index) => {
            const html = await mdToHTML(block)
            return {
              id: `md-block-${index}`,
              html,
            }
          }),
      )

      setBlocks(processedBlocks)
      setLoading(false)
    }

    splitMarkdown()
  }, [content])

  if (loading && blocks.length === 0) {
    return <div className="p-4">加载中...</div>
  }

  return (
    <VirtualDyScroll
      data={ blocks }
      itemHeight={ itemHeight }
      overscan={ overscan }
      style={ style }
      className={ cn('VirtualizedMarkdownContainer', className) }
    >
      { block => (
        <MdToHtml
          content={ block.html }
          needParse={ false }
        />
      ) }
    </VirtualDyScroll>
  )
})

VirtualizedMarkdown.displayName = 'VirtualizedMarkdown'

type MarkdownBlock = {
  id: string
  html: string
}

export type VirtualizedMarkdownProps = {
  /**
   * Markdown内容
   */
  content: string
  /**
   * 项目的估计高度（像素）
   * @default 40
   */
  itemHeight?: number
  /**
   * 可视区域外额外渲染的项目数量
   * @default 10
   */
  overscan?: number
} & React.HTMLAttributes<HTMLDivElement>
