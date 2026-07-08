import type { XMarkdownProps } from '@ant-design/x-markdown'
import { XMarkdown } from '@ant-design/x-markdown'
import { memo, useMemo } from 'react'
import { cn } from 'utils'

function TailCursor() {
  return <span
    className="inline-block h-[1.1em] w-0.5 translate-y-[0.15em] rounded-full bg-current opacity-80"
    style={ { animation: 'tail-blink 1s steps(2, start) infinite' } }
  />
}

const markdownComponents: NonNullable<XMarkdownProps['components']> = {}

const streamingAnimationConfig = {
  fadeDuration: 200,
  easing: 'ease-in-out',
} satisfies NonNullable<NonNullable<XMarkdownProps['streaming']>['animationConfig']>

const streamingTail = {
  component: TailCursor,
} satisfies Exclude<NonNullable<XMarkdownProps['streaming']>['tail'], boolean | undefined>

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
      tail: streamingTail,
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
