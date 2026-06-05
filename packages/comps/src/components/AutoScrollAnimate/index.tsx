'use client'

import type { RefObject } from 'react'
import { useAutoScrollBottom, useLatestCallback, useScrollBottom } from 'hooks'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react'
import { cn } from 'utils'

/**
 * 自动滚动组件
 * - 当检测到有新内容，自动滚动到底
 * - 用户向上滚动时，取消自动滚动
 * - 用户滚动到顶部时，再开启自动滚动到底
 */
const InnerAutoScrollAnimate = forwardRef<AutoScrollAnimateRef, AutoScrollAnimateProps>((
  {
    children,
    autoScroll = true,
    fadeInMask = true,
    fadeInMaskHeight = 18,
    fadeInColor = 'rgb(var(--background) / 1)',
    height = '100%',
    width = '100%',
    scrollBottomThreshold = 5,
    delay = 0,
    smooth = true,
    updateBy,
    className,
    containerClassName,
    style,
    ...rest
  },
  ref,
) => {
  const containerRef = useRef<HTMLDivElement>(null)

  /** 智能自动滚动：基于用户滚轮意图，不与向上滚动对抗（逻辑抽到 hooks 通用复用） */
  const {
    shouldAutoScroll,
    shouldAutoScrollRef,
    isDownScrollRef,
    bindScrollEl,
    setShouldAutoScroll,
  } = useAutoScrollBottom({ enabled: autoScroll, threshold: scrollBottomThreshold })

  /** 合并本地 containerRef（供 useScrollBottom / MutationObserver 用）与 hook 的滚动绑定 */
  const setContainerRef = useLatestCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    bindScrollEl(node)
  })

  /** 当内容变化时自动滚动 */
  const { scrollToBottom } = useScrollBottom(
    containerRef as RefObject<HTMLElement>,
    [updateBy, shouldAutoScroll],
    {
      enabled: shouldAutoScroll,
      delay,
      smooth,
    },
  )

  /**
   * 如果没指定 updateBy，则使用 MutationObserver 监听内容变化
   */
  useEffect(
    () => {
      if (updateBy || !containerRef.current) {
        return
      }

      const ob = new MutationObserver(() => {
        if (shouldAutoScrollRef.current) {
          scrollToBottom()
        }
      })

      ob.observe(containerRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      })

      return () => {
        ob.disconnect()
      }
    },
    [scrollToBottom, updateBy],
  )

  useImperativeHandle(ref, () => ({
    scrollToBottom,
    isDownScroll: () => isDownScrollRef.current,
    setAutoScroll: (enabled: boolean) => {
      setShouldAutoScroll(enabled)
      isDownScrollRef.current = enabled
    },
  }))

  return (
    <div
      className={ cn(
        'relative overflow-hidden',
        containerClassName,
      ) }
      style={ {
        height,
        width,
        ...style,
      } }
      { ...rest }
    >
      {/* 内容容器 */ }
      <div
        ref={ setContainerRef }
        className={ cn(
          'h-full w-full overflow-y-auto overflow-x-hidden',
          className,
        ) }
      >
        { children }
      </div>

      {/* 顶部渐变蒙层 */ }
      { fadeInMask && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0"
          style={ {
            background: `linear-gradient(to bottom, ${fadeInColor} 0%, #0000 100%)`,
            height: fadeInMaskHeight,
          } }
        />
      ) }

      {/* 底部渐变蒙层 */ }
      { fadeInMask && (
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          style={ {
            background: `linear-gradient(to top, ${fadeInColor} 0%, #0000 100%)`,
            height: fadeInMaskHeight,
          } }
        />
      ) }
    </div>
  )
})

/**
 * 自动滚动组件
 * - 当检测到有新内容，自动滚动到底
 * - 用户向上滚动时，取消自动滚动
 * - 用户滚动到顶部时，再开启自动滚动到底
 */
export const AutoScrollAnimate = memo(InnerAutoScrollAnimate) as typeof InnerAutoScrollAnimate

AutoScrollAnimate.displayName = 'AutoScrollView'

export type AutoScrollAnimateRef = {
  /**
   * 滚动到底部
   */
  scrollToBottom: () => void
  /**
   * 用户是否向下滚动
   */
  isDownScroll: () => boolean

  /**
   * 设置是否自动滚动
   */
  setAutoScroll: (enabled: boolean) => void
}

export type AutoScrollAnimateProps = {
  /**
   * 子组件内容
   */
  children: React.ReactNode
  /**
   * 是否自动滚动至底部总开关
   * @default true
   */
  autoScroll?: boolean
  /**
   * 是否开启上下的蒙层
   * @default true
   */
  fadeInMask?: boolean
  /**
   * 蒙层渐变的高度
   */
  fadeInMaskHeight?: number
  /**
   * 蒙层渐变的基础颜色
   * @default 'rgb(var(--background) / 1)'
   */
  fadeInColor?: string
  /**
   * 容器高度
   * @default '100%'
   */
  height?: string | number
  /**
   * 容器宽度
   * @default '100%'
   */
  width?: string | number
  /**
   * 滚动到底判断阈值
   * @default 2
   */
  scrollBottomThreshold?: number
  /**
   * 延迟滚动时间，当内容变化过快，可制造动画效果
   * @default 0
   */
  delay?: number
  /**
   * 是否使用平滑滚动动画
   * @default true
   */
  smooth?: boolean
  /**
   * 监听更新滚动的值，不传递则根据 children textContent 变化更新
   */
  updateBy?: any

  className?: string
  containerClassName?: string
  style?: React.CSSProperties
}
& React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
