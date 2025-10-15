'use client'

import { clsx } from 'clsx'
import { useAsyncEffect, useInsertStyle, useTheme, useWatchThrottle } from 'hooks'
import { forwardRef, memo, useState } from 'react'
import { mdToHTML } from 'utils'

export const MdToHtml = memo(forwardRef<MdToHtmlRef, MdToHtmlProps>((
  {
    style,
    className,
    content,
    needParse = true,
    throttleTime = 32,
  },
  ref,
) => {
  const [html, setHtml] = useState('')
  const [theme] = useTheme()
  const throttleContent = useWatchThrottle(content, throttleTime)

  useInsertStyle(new URL('styles/css/github-markdown.css', import.meta.url).href)
  useInsertStyle(
    theme === 'dark'
      ? new URL('styles/css/github-dark.css', import.meta.url).href
      : new URL('styles/css/github-light.css', import.meta.url).href,
  )

  useAsyncEffect(async () => {
    if (needParse) {
      const html = await mdToHTML(throttleContent)
      setHtml(html)
    }
  }, [throttleContent, needParse])

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
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type MdToHtmlRef = HTMLDivElement
