'use client'

import { useWatchThrottleState } from 'hooks'
import { forwardRef, memo, useEffect, useState } from 'react'
import { cn, mdToHTML } from 'utils'
import 'styles/css/github-markdown.css'
import 'styles/css/markdown-task-list.css'

export const MdToHtml = memo(forwardRef<MdToHtmlRef, MdToHtmlProps>((
  {
    style,
    className,
    content,
    needParse = true,
    throttleTime = 32,
    skipXSS = false,
    postProcess,
    preprocessMarkdownFormat = true,
    withMarkdownBodyStyles = true,
  },
  ref,
) => {
  const [html, setHtml] = useState('')
  const throttleContent = useWatchThrottleState(content, throttleTime)

  useEffect(() => {
    if (!needParse)
      return

    /** 同步失效标记，防止流式更新时旧解析结果覆盖新结果（last-write-wins） */
    let cancelled = false

    mdToHTML(throttleContent, {
      skipXSS,
      postProcess,
      preprocessMarkdownFormat,
    }).then((result) => {
      if (!cancelled)
        setHtml(result)
    })

    return () => {
      cancelled = true
    }
  }, [throttleContent, needParse, skipXSS, postProcess, preprocessMarkdownFormat])

  return <div
    ref={ ref }
    className={ cn(
      'MdToHtmlContainer overflow-auto',
      withMarkdownBodyStyles && 'markdown-body',
      className,
    ) }
    style={ style }
    // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
    dangerouslySetInnerHTML={ {
      __html: needParse
        ? html
        : content,
    } }
  />
}))

MdToHtml.displayName = 'MdToHtml'

export type MdToHtmlProps = {
  className?: string
  style?: React.CSSProperties
  content: string
  /**
   * 是否需要解析 Markdown 为 HTML？
   * 在部分情况下，外部直接传入 HTML 更高效
   * @default true
   */
  needParse?: boolean
  throttleTime?: number
  skipXSS?: boolean
  postProcess?: (html: string) => Promise<string> | string
  /**
   * 是否应用 Markdown 格式预处理（处理粘连的格式符号）
   * @default true
   */
  preprocessMarkdownFormat?: boolean
  /**
   * 是否应用内置 GitHub Markdown 样式
   * @default true
   */
  withMarkdownBodyStyles?: boolean
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type MdToHtmlRef = HTMLDivElement
