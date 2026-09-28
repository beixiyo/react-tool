/**
 * VirtualDyScroll 类型声明
 */

import type * as React from 'react'

export type VirtualDyScrollProps<T extends { id?: string }> =
  & {
    /** 要渲染的数据数组 */
    data: T[]

    /**
     * 渲染每个项目的函数
     * @param item 当前项目数据
     * @param index 当前项目索引
     */
    children: (item: T, index: number) => React.ReactNode

    beforeChildren?: React.ReactNode

    /**
     * 项目的估计高度（像素）
     * @default 40
     */
    itemHeight?: number

    /**
     * 可视区域外额外渲染的项目数量，用于防止快速滚动时出现白屏
     * @default 5
     */
    overscan?: number

    className?: string
    contentClassName?: string

    /** 自定义样式 */
    style?: React.CSSProperties

    /**
     * 是否有更多数据可加载
     * @default false
     */
    hasMore?: boolean

    /**
     * 展示 loading 按钮
     * @default false
     */
    showLoading?: boolean

    /**
     * 加载更多数据的回调函数，当滚动到底部时触发
     * @returns 返回一个 Promise，用于标记加载完成
     */
    loadMore?: () => Promise<any>

    /**
     * 是否立即加载一次
     * @default true
     */
    immediate?: boolean
  }
  & Omit<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'children'
  >
