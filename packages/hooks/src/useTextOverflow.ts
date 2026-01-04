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

  // 用于返回的 ref，保持原始类型
  const returnRef = externalRef || internalRef

  const [isOverflowing, setIsOverflowing] = useState(false)
  const [textContent, setTextContent] = useState<string>('')
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    if (!contentRef.current || showAllText) {
      setIsOverflowing(false)
      setTextContent('')
      setTooltipContent(null)
      return
    }

    const checkOverflow = () => {
      if (!contentRef.current) {
        return
      }

      const element = contentRef.current
      // 检测是否溢出：根据 checkVertical 决定是否检测垂直溢出
      const { scrollWidth, clientWidth, scrollHeight, clientHeight } = element

      const isOverflow = checkVertical
        ? scrollHeight > clientHeight || scrollWidth > clientWidth
        : scrollWidth > clientWidth

      if (isOverflow) {
        setIsOverflowing(true)

        const text = element.textContent || ''
        const trimmedText = text.trim()
        setTextContent(trimmedText)

        // 如果提取到文本内容，使用文本；否则尝试使用 children
        if (trimmedText) {
          setTooltipContent(trimmedText)
        }
        else {
          // 如果 children 是字符串或数字，也可以作为 tooltip
          const childrenStr = typeof children === 'string' || typeof children === 'number'
            ? String(children)
            : null
          setTooltipContent(childrenStr || null)
        }
      }
      else {
        setIsOverflowing(false)
        setTextContent('')
        setTooltipContent(null)
      }
    }

    // 立即检查一次
    checkOverflow()

    // 监听窗口大小变化和内容变化
    const observer = new ResizeObserver(checkOverflow)
    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    // 使用 MutationObserver 监听内容变化
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
  }, [contentRef, checkVertical, showAllText, children, ...deps])

  return {
    contentRef: returnRef as React.RefObject<HTMLElement | null>,
    isOverflowing,
    textContent,
    tooltipContent: tooltipContent || textContent || null,
  }
}
