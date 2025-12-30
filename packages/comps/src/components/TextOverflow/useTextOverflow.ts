import { useEffect, useRef, useState } from 'react'

export type UseTextOverflowOptions = {
  children?: React.ReactNode
  enableTooltip?: boolean
  showAllText?: boolean
}

export function useTextOverflow(options: UseTextOverflowOptions) {
  const {
    children,
    enableTooltip = true,
    showAllText = false,
  } = options

  const contentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null)

  /** 检测文本是否溢出 */
  useEffect(() => {
    if (!enableTooltip || !contentRef.current || showAllText) {
      setIsOverflowing(false)
      setTooltipContent(null)
      return
    }

    const checkOverflow = () => {
      const element = contentRef.current
      if (!element) {
        return
      }

      /** 检测是否溢出：scrollHeight 大于 clientHeight 或 scrollWidth 大于 clientWidth */
      const isOverflow = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
      setIsOverflowing(isOverflow)

      /** 如果溢出，提取文本内容作为 tooltip */
      if (isOverflow) {
        const textContent = element.textContent?.trim()
        /** 如果提取到文本内容，使用文本；否则使用原始 children（可能是 React 元素） */
        if (textContent) {
          setTooltipContent(textContent)
        }
        else {
          /** 如果 children 是字符串或数字，也可以作为 tooltip */
          const childrenStr = typeof children === 'string' || typeof children === 'number'
            ? String(children)
            : null
          setTooltipContent(childrenStr || null)
        }
      }
      else {
        setTooltipContent(null)
      }
    }

    /** 初始检测，延迟一帧确保 DOM 已渲染 */
    const timer = setTimeout(() => {
      checkOverflow()
    }, 0)

    /** 监听窗口大小变化和内容变化 */
    const resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(contentRef.current)

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [children, enableTooltip, showAllText])

  return {
    contentRef,
    isOverflowing,
    tooltipContent,
  }
}
