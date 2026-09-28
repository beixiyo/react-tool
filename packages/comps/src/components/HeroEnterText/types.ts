import type * as React from 'react'

export type HeroEnterTextProps =
  & {
    /**
     * 渲染的元素标签（多态）
     * @default 'h1'
     */
    as?: React.ElementType

    /**
     * @default '2s'
     */
    duration?: string
    /**
     * @default '12vw'
     */
    finalFontSize?: string
    /**
     * @default '300vw'
     */
    initFontSize?: string
    /**
     * @default 'rgb(var(--text) / 1)'
     */
    color?: string
    /**
     * 背景图片地址；以 http 开头会自动包裹成 url(...)，否则原样作为 CSS 背景值
     *
     * @default 'https://images.pexels.com/...'（默认指向外部 pexels 图，生产环境建议替换为本地资源）
     */
    backgroundImage?: string
  }
  & React.HTMLAttributes<HTMLElement>
