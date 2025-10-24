'use client'

import type { CodeHighlightProps } from './types'
import { copyToClipboard } from '@jl-org/tool'
import { useWatchThrottle, useWorker } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import ShikiWorker from '../../worker/shikiWorker?worker'
import { Button } from '../Button'
import { Message } from '../Message'
import styles from './styles.module.css'

export const CodeHighlight = memo<CodeHighlightProps>((
  {
    code,
    language = 'javascript',
    style,
    className,
    showLineNumbers = true,
    theme = 'vitesse-dark',
    copyable = true,
    lineHeight = 0.5,
    throttleUpdateTime = 20,
  },
) => {
  const codeRef = useRef<HTMLDivElement>(null)
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const throttleHighlightCode = useWatchThrottle(highlightedCode, throttleUpdateTime, {
    enable: throttleUpdateTime > 0,
  })

  /** 使用worker进行代码高亮 */
  const { postMessage, onMessage, isReady, unbindEvent } = useWorker(ShikiWorker)

  /** 使用shiki worker进行语法高亮 */
  useEffect(() => {
    if (!isReady)
      return

    /** 设置消息处理函数 */
    const handleMessage = (event: MessageEvent) => {
      const { html, success, error } = event.data

      setHighlightedCode(html)

      if (!success && error) {
        console.error('Syntax highlighting error:', error)
      }
    }

    /** 监听worker消息 */
    onMessage(handleMessage)

    /** 发送代码到worker处理 */
    postMessage({
      code,
      language,
      theme,
      showLineNumbers,
    })

    /** 清理函数 */
    return () => {
      unbindEvent()
    }
  }, [code, isReady, language, onMessage, postMessage, showLineNumbers, theme, unbindEvent])

  /** 复制代码 */
  const handleCopy = useCallback(() => {
    copyToClipboard(code).then(() => {
      Message.success('Copy Success')
    })
  }, [code])

  return (
    <div
      className={ cn(
        'relative flex flex-col h-full border border-gray-200 dark:border-gray-800 rounded-lg bg-[#121212] dark:bg-[#121212]',
        className,
      ) }
      style={ style }
    >
      { copyable && (
        <Button
          onClick={ handleCopy }
          aria-label="Copy"
          className="absolute right-2 top-2 z-10 h-6 p-1"
          size="sm"
        >
          Copy
        </Button>
      ) }

      <div
        ref={ codeRef }
        className={ cn(
          'overflow-auto grow h-full',
          styles.shikiContainer,
          showLineNumbers && styles.lineNumbers,
          styles.lineSpacingCustom,
        ) }
        style={ {
          // @ts-ignore
          '--line-height': lineHeight,
        } }
        dangerouslySetInnerHTML={ { __html: throttleHighlightCode } }
      />
    </div>
  )
})

CodeHighlight.displayName = 'CodeHighlight'
