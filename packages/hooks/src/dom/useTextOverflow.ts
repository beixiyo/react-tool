import { useEffect, useRef, useState } from 'react'

export interface UseTextOverflowOptions {
  /**
   * 内容元素的 ref（如果不提供，hook 会内部创建）
   */
  contentRef?: React.RefObject<HTMLElement | null>
  /**
   * 是否检测垂直溢出（多行文本）
   * @default false
   */
  checkVertical?: boolean
  /**
   * 是否显示全部文本（如果为 true，则不检测溢出）
   * @default false
   */
  showAllText?: boolean
  /**
   * children 内容（用于作为 tooltip 的 fallback）
   */
  children?: React.ReactNode
  /**
   * 依赖项数组，当依赖变化时重新检测
   */
  deps?: React.DependencyList
}

/**
 * 检测文本是否溢出并提取文本内容
 *
 * @param options - 配置选项
 * @returns 返回是否溢出、文本内容和 ref
 */
export function useTextOverflow(options: UseTextOverflowOptions = {}) {
  const {
    contentRef: externalRef,
    checkVertical = false,
    showAllText = false,
    children,
    deps = [],
  } = options

  const internalRef = useRef<HTMLDivElement>(null)
  const contentRef = externalRef || (internalRef as React.RefObject<HTMLElement | null>)

  const returnRef = externalRef || internalRef

  const [isOverflowing, setIsOverflowing] = useState(false)
  const [textContent, setTextContent] = useState<string>('')
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null)

  const prevRef = useRef({ isOverflowing: false, textContent: '', tooltipContent: null as React.ReactNode })
  const childrenRef = useRef(children)
  childrenRef.current = children

  useEffect(() => {
    if (!contentRef.current || showAllText) {
      const prev = prevRef.current
      if (prev.isOverflowing || prev.textContent !== '' || prev.tooltipContent !== null) {
        prevRef.current = { isOverflowing: false, textContent: '', tooltipContent: null }
        setIsOverflowing(false)
        setTextContent('')
        setTooltipContent(null)
      }
      return
    }

    const checkOverflow = () => {
      if (!contentRef.current)
        return

      const element = contentRef.current
      const { scrollWidth, clientWidth, scrollHeight, clientHeight } = element

      const newIsOverflow = checkVertical
        ? scrollHeight > clientHeight || scrollWidth > clientWidth
        : scrollWidth > clientWidth

      let newTextContent = ''
      let newTooltipContent: React.ReactNode = null

      if (newIsOverflow) {
        newTextContent = (element.textContent || '').trim()

        if (newTextContent) {
          newTooltipContent = newTextContent
        }
        else {
          const c = childrenRef.current
          newTooltipContent = typeof c === 'string' || typeof c === 'number'
            ? String(c)
            : null
        }
      }

      const prev = prevRef.current
      if (
        prev.isOverflowing === newIsOverflow
        && prev.textContent === newTextContent
        && prev.tooltipContent === newTooltipContent
      ) {
        return
      }

      prevRef.current = { isOverflowing: newIsOverflow, textContent: newTextContent, tooltipContent: newTooltipContent }

      if (prev.isOverflowing !== newIsOverflow)
        setIsOverflowing(newIsOverflow)
      if (prev.textContent !== newTextContent)
        setTextContent(newTextContent)
      if (prev.tooltipContent !== newTooltipContent)
        setTooltipContent(newTooltipContent)
    }

    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    const mutationObserver = new MutationObserver(checkOverflow)
    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [contentRef, checkVertical, showAllText, ...deps])

  return {
    contentRef: returnRef as React.RefObject<HTMLElement | null>,
    isOverflowing,
    textContent,
    tooltipContent: tooltipContent || textContent || null,
  }
}
