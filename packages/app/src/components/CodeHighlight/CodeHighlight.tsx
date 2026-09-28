'use client'

import { Copy } from 'comps'
import { useTheme, useWatchThrottleState, useWorker } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import type { ShikiHighlightRequest, ShikiHighlightResult } from '../../worker/shikiWorker'
import ShikiWorker from '../../worker/shikiWorker?worker'
import styles from './styles.module.css'
import type { CodeHighlightProps } from './types'

export const CodeHighlight = memo<CodeHighlightProps>((
  {
    code,
    language = 'javascript',
    style,
    className,
    showLineNumbers = true,
    theme,
    copyable = true,
    lineHeight = 0.5,
    throttleUpdateTime = 20,
  },
) => {
  const codeRef = useRef<HTMLDivElement>(null)
  const [siteTheme] = useTheme()
  /** 未显式指定时跟随站点主题，保证代码画布与站点明暗一致 */
  const resolvedTheme = theme ?? (siteTheme === 'dark'
    ? 'vitesse-dark'
    : 'vitesse-light')
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const throttleHighlightCode = useWatchThrottleState(highlightedCode, throttleUpdateTime, {
    enable: throttleUpdateTime > 0,
  })

  /**
   * 所有实例共享一个常驻 shiki worker：每个 worker 都要加载 shiki 主包与 oniguruma wasm 并编译语法，
   * 按实例创建会让面板开关、文件切换反复付出这笔开销
   */
  const { request, isReady } = useWorker(ShikiWorker, { shared: { keepAlive: true } })

  /** cancelled 防止旧请求结果覆盖新代码 */
  useEffect(() => {
    if (!isReady) return
    let cancelled = false

    request<ShikiHighlightResult, ShikiHighlightRequest>({
      code,
      language,
      theme: resolvedTheme,
      showLineNumbers,
    }).then(({ html, success, error }) => {
      if (cancelled) {
        return
      }
      setHighlightedCode(html)
      if (!success && error) {
        console.error('Syntax highlighting error:', error)
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        console.error('Syntax highlighting request failed:', error)
      }
    })

    return () => {
      cancelled = true
    }
  }, [code, isReady, language, request, showLineNumbers, resolvedTheme])

  return (
    <div
      className={ cn(
        'relative flex flex-col h-full rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#121212]',
        className,
      ) }
      style={ style }
    >
      { copyable && (
        <Copy
          text={ code }
          buttonProps={ {
            /** 覆盖层随代码画布明暗反转：亮色画布用黑色半透明，暗色用白色半透明 */
            variant: 'ghost',
            className:
              'absolute right-2 top-2 z-10 h-6 p-1 bg-black/5 text-gray-500 hover:bg-black/10 active:bg-black/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/25',
            size: 'sm',
            'aria-label': 'Copy',
          } }
        />
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
