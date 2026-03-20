import { XMarkdown } from '@ant-design/x-markdown'
import { memo } from 'react'
import { cn } from 'utils'

function TailCursor() {
  return <span
    className="inline-block h-[1.1em] w-[2px] translate-y-[0.15em] rounded-full bg-current opacity-80"
    style={ { animation: 'tail-blink 1s steps(2, start) infinite' } }
  />
}

export const StreamingMarkdown = memo<StreamingMarkdownProps>(({
  content,
  isStreaming = false,
  className,
  style,
}) => {
  return (
    <XMarkdown
      className={ cn(
        'StreamingMarkdownContainer',
        className,
      ) }
      style={ style }
      content={ content }
      openLinksInNewTab
      streaming={ {
        hasNextChunk: isStreaming,
        enableAnimation: true,
        tail: isStreaming
          ? { component: TailCursor }
          : false,
        animationConfig: {
          fadeDuration: 200,
          easing: 'ease-in-out',
        },
      } }
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
