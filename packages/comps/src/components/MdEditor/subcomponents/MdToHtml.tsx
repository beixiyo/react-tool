'use client'

import { useWatchThrottleState } from 'hooks'
import { memo, useEffect, useState } from 'react'
import { cn, mdToHTML } from 'utils'
import type { MdToHtmlProps } from '../types'
import 'styles/css/github-markdown.css'
import 'styles/css/markdown-task-list.css'

export const MdToHtml = memo(({
  ref,
  style,
  className,
  content,
  needParse = true,
  throttleTime = 32,
  skipXSS = false,
  postProcess,
  preprocessMarkdownFormat = true,
  withMarkdownBodyStyles = true,
}: MdToHtmlProps) => {
  const [html, setHtml] = useState('')
  const throttleContent = useWatchThrottleState(content, throttleTime)

  useEffect(() => {
    if (!needParse) return

    /** 同步失效标记，防止流式更新时旧解析结果覆盖新结果（last-write-wins） */
    let cancelled = false

    mdToHTML(throttleContent, {
      skipXSS,
      postProcess,
      preprocessMarkdownFormat,
    }).then((result) => {
      if (!cancelled) setHtml(result)
    })

    return () => {
      cancelled = true
    }
  }, [throttleContent, needParse, skipXSS, postProcess, preprocessMarkdownFormat])

  return (
    <div
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
  )
})

MdToHtml.displayName = 'MdToHtml'
