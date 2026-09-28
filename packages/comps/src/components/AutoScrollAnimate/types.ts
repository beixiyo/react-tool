/**
 * AutoScrollAnimate 组件类型声明
 */
import type * as React from 'react'
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

export type AutoScrollAnimateProps =
  & {
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
     * @default 5
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
    updateBy?: unknown

    className?: string
    containerClassName?: string
    style?: React.CSSProperties
  }
  & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
