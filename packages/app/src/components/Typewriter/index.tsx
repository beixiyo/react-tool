'use client'

import { useMutationObserver } from '@/hooks'
import clsx from 'clsx'
import React, { memo, useCallback, useRef, useState } from 'react'

/** 辅助函数：递归查找最后一个非空的文本节点 */
function findLastTextNode(node: Node): Text | null {
  /** 基本情况：如果它是一个包含实际内容的文本节点 */
  if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim().length) {
    return node as Text
  }

  /** 如果它是一个元素节点，反向搜索其子节点 */
  if (node.nodeType === Node.ELEMENT_NODE && node.hasChildNodes()) {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const result = findLastTextNode(node.childNodes[i])
      if (result) {
        return result // 在此分支中找到了最后一个文本节点
      }
    }
  }

  /**
   * 如果它是一个没有文本节点子元素的元素节点（例如 <img>, <br> 或空容器）
   * 或一个只包含空白的文本节点，则返回 null
   */
  return null
}

export const Typewriter = memo(({
  children,
  cursorColor = '#000',
  cursorWidth = '2px',
  blinkSpeed = '1.5s',
  className,
  cursorClassName,
  done = false,
  as: ContainerComponent = 'div',
}: TypewriterProps) => {
  const containerRef = useRef<HTMLElement>(null)
  const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    opacity: 0, // 初始隐藏
    width: typeof cursorWidth === 'number'
      ? `${cursorWidth}px`
      : cursorWidth,
    animationDuration: blinkSpeed,
    top: 0,
    left: 0,
    height: '1em', // 默认高度，将被覆盖
    animationIterationCount: 'infinite',
  })
  const [showCursor, setShowCursor] = useState(false)

  const updateCursorPosition = useCallback(() => {
    /** 如果禁用、已完成或 ref 未就绪，则立即隐藏光标 */
    if (done || !containerRef.current) {
      setShowCursor(false)
      return
    }

    const containerElement = containerRef.current
    const lastTextNode = findLastTextNode(containerElement)

    if (lastTextNode?.nodeValue) { // 确保 lastTextNode 和 nodeValue 都存在
      const range = document.createRange()
      try {
        /** 将范围定位在找到的文本节点的末尾 */
        const textLength = lastTextNode.nodeValue.length
        range.setStart(lastTextNode, textLength)
        range.setEnd(lastTextNode, textLength)

        const rect = range.getBoundingClientRect() // 获取该点的位置信息
        const containerRect = containerElement.getBoundingClientRect() // 获取容器的位置信息

        /**
         * 计算相对于容器的位置
         * 如果容器可能滚动，需要加上 scrollTop/scrollLeft
         */
        const top = rect.bottom - containerRect.top - rect.height + containerElement.scrollTop
        const left = rect.left - containerRect.left + containerElement.scrollLeft
        const height = rect.height || Number.parseInt(getComputedStyle(containerElement).lineHeight, 10) || 18 // 使用计算出的实际行高或回退值

        /** 更新样式 - 只有在位置或尺寸显著变化时才更新，以避免微小的重渲染 */
        setCursorStyle((prevStyle) => {
          const newStyle = {
            ...prevStyle,
            top: `${top}px`,
            left: `${left + 2}px`,
            height: `${height}px`,
            opacity: 1, // 使光标可见
            animationDuration: blinkSpeed, // 确保闪烁速度更新
            width: typeof cursorWidth === 'number'
              ? `${cursorWidth}px`
              : cursorWidth, // 确保宽度更新
          }
          /** 基本检查，防止在值相同时不必要地更新状态 */
          if (JSON.stringify(newStyle) !== JSON.stringify(prevStyle)) {
            return newStyle
          }
          return prevStyle
        })
        setShowCursor(true) // 允许渲染光标元素
      }
      catch (error) {
        console.error('Typewriter: Error calculating cursor position:', error)
        setShowCursor(false) // 出错时隐藏光标
      }
    }
    else {
      /**
       * 未找到文本节点（例如，children 为空或仅包含非文本元素）
       * 这种情况下可靠地隐藏光标
       */
      setShowCursor(false)
    }
  }, [done, cursorWidth, blinkSpeed])

  useMutationObserver(
    containerRef,
    updateCursorPosition,
  )

  return (
    <ContainerComponent
      ref={ containerRef as any } // 根据 ContainerComponent 调整 ref 类型
      className={ clsx(
        'data-typewriter-container relative inline', // 基础定位上下文
        className,
      ) }
    >
      { children }
      {/* 仅在启用、未完成且计算了位置后显示光标 */ }
      { !done && showCursor && (
        <span
          aria-hidden="true" // 对屏幕阅读器隐藏
          className={ clsx(
            'inline-block pointer-events-none', // 防止光标干扰鼠标事件
            'animate-flash', // 应用闪烁动画
            cursorClassName, // 应用自定义光标样式类
          ) }
          style={ {
            backgroundColor: cursorColor,
            ...cursorStyle,
          } } // 应用计算出的位置和大小
          data-typewriter-cursor // 添加 data 属性 (可选)
        />
      ) }
    </ContainerComponent>
  )
})

// --- 组件 Props 接口定义 ---
export type TypewriterProps = {
  /**
   * 要显示的内容。光标将跟随在这些子元素中找到的最后一个文本节点的末尾。
   */
  children: React.ReactNode
  /**
   * 光标的颜色。
   * @default '#000'
   */
  cursorColor?: string
  /**
   * 光标的宽度。可以是数字（像素）或字符串（例如 '2px', '0.1em'）。
   * @default '2px'
   */
  cursorWidth?: string | number
  /**
   * 光标闪烁动画周期的持续时间（例如 '1s', '750ms'）。
   * @default '1.5s'
   */
  blinkSpeed?: string
  /**
   * 应用于容器元素的可选附加 CSS 类。
   */
  className?: string
  /**
   * 应用于光标 span 元素本身的可选附加 CSS 类。
   */
  cursorClassName?: string
  /**
   * 当"打字"或相关过程完成时设置为 `true`，以隐藏光标。
   * @default false
   */
  done?: boolean
  /**
   * 用于包裹子元素的容器元素的 HTML 标签。
   * 对于语义正确性很有用（例如 'p', 'div', 'span'）。
   * @default 'div'
   */
  as?: React.ElementType
}

/** 可选：显式设置 displayName 以便于调试 */
Typewriter.displayName = 'Typewriter'
