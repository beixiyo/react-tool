'use client'

import { clsx } from 'clsx'
import { useCustomEffect, useInsertStyle, useWatchThrottle } from 'hooks'
import { forwardRef, memo, useState } from 'react'
import { mdToHTML } from 'utils'

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
  },
  ref,
) => {
  const [html, setHtml] = useState('')
  const throttleContent = useWatchThrottle(content, throttleTime)

  useInsertStyle(new URL('styles/css/github-markdown.css', import.meta.url).href)

  useCustomEffect(async () => {
    if (needParse) {
      const html = await mdToHTML(throttleContent, {
        skipXSS,
        postProcess,
        preprocessMarkdownFormat,
      })
      setHtml(html)
    }
  }, [throttleContent, needParse, skipXSS, postProcess, preprocessMarkdownFormat])

  return <div
    ref={ ref }
    className={ clsx(
      'MdToHtmlContainer markdown-body overflow-auto',
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
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type MdToHtmlRef = HTMLDivElement
