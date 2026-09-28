/**
 * SeamlessScroll 类型声明
 */

export type SeamlessScrollProps =
  & {
    /**
     * 滚动速度（像素/秒）
     * @default 50
     */
    speed?: number
    /**
     * 滚动方向
     * @default 'left'
     */
    direction?: 'left' | 'right' | 'up' | 'down'
    /**
     * 悬停时暂停滚动
     * @default true
     */
    pauseOnHover?: boolean
    /**
     * 元素之间的间距（像素）
     * @default 20
     */
    gap?: number
  }
  & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
