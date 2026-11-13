import type { StreamingOption, XMarkdownProps } from '@ant-design/x-markdown'
import { XMarkdown } from '@ant-design/x-markdown'
import { memo, useMemo } from 'react'
import { cn } from 'utils'

const markdownComponents: NonNullable<XMarkdownProps['components']> = {}

/**
 * 淡入以句子为单位：库内打字机逐帧放字，若按 chunk 淡入会每帧生成一个永久保留的 span
 * （x-markdown `splitBy` 文档：与 `typewriter` 同用时应选 `sentence`）
 */
const streamingAnimationConfig = {
  fadeDuration: 400,
  easing: 'ease-in-out',
  splitBy: 'sentence',
} satisfies NonNullable<StreamingOption['animationConfig']>

export const StreamingMarkdown = memo<StreamingMarkdownProps>(({
  content,
  isStreaming = false,
  className,
  style,
}) => {
  const streaming = useMemo<XMarkdownProps['streaming']>(() => {
    if (!isStreaming) return undefined

    /**
     * 与 x-markdown `streaming={true}` 预设一致，再加按句淡入；对象形式不会套用预设，需逐项显式开启
     * - incremental：按行首标题分节，只重新解析最后一节，已完成的节按源字符串 memo 跳过
     * - incompleteMarkdown：写到一半的强调、行内代码、链接文字立即按完成态显示
     * - typewriter：按 chunk 到达节奏自适应匀速放字（rAF 驱动，窗口隐藏时停止，恢复后按积压量加速追上）
     */
    return {
      hasNextChunk: true,
      incremental: true,
      incompleteMarkdown: 'complete',
      typewriter: true,
      enableAnimation: true,
      animationConfig: streamingAnimationConfig,
    }
  }, [isStreaming])

  return (
    <XMarkdown
      className={ cn(
        'StreamingMarkdownContainer',
        className,
      ) }
      style={ style }
      content={ content }
      openLinksInNewTab
      components={ markdownComponents }
      streaming={ streaming }
    />
  )
})

StreamingMarkdown.displayName = 'StreamingMarkdown'

export type StreamingMarkdownProps = {
  /** Markdown 内容 */
  content: string
  /** 是否正在流式输出 */
  isStreaming?: boolean
  className?: string
  style?: React.CSSProperties
}
