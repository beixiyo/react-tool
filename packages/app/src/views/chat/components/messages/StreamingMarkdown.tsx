import type { XMarkdownProps } from '@ant-design/x-markdown'
import { XMarkdown } from '@ant-design/x-markdown'
import { memo, useMemo } from 'react'
import { cn } from 'utils'

const markdownComponents: NonNullable<XMarkdownProps['components']> = {}

/** Chat mock 每 80ms 追加一个字符，400ms 的淡入窗口覆盖最新五个字符。 */
const streamingAnimationConfig = {
  fadeDuration: 400,
  easing: 'ease-in-out',
} satisfies NonNullable<NonNullable<XMarkdownProps['streaming']>['animationConfig']>

export const StreamingMarkdown = memo<StreamingMarkdownProps>(({
  content,
  isStreaming = false,
  className,
  style,
}) => {
  const streaming = useMemo<XMarkdownProps['streaming']>(() => {
    if (!isStreaming)
      return undefined

    return {
      hasNextChunk: true,
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
