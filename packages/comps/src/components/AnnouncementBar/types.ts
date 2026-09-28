/**
 * AnnouncementBar 组件类型声明
 */

export type AnnouncementBarProps = {
  items: React.ReactNode[]
  direction?: 'horizontal' | 'vertical'
  /**
   * 轮播间隔时间，单位：毫秒
   * @default 3000
   */
  durationMs?: number
  /**
   * 切换过渡动画时长，单位：毫秒（同时用于内联 transition 与复位定时器，保证单一来源）
   * @default 500
   */
  transitionMs?: number
  /**
   * 是否在鼠标悬停时暂停轮播
   * @default true
   */
  pauseOnHover?: boolean
  /**
   * 单条内容样式
   * @default ''
   */
  itemClassName?: string
  /**
   * 无障碍标签文案
   * @default 'Announcement'
   */
  ariaLabel?: string
  /**
   * 轮播内容更新的 aria-live 朗读策略
   * @default 'polite'
   */
  ariaLive?: 'off' | 'polite' | 'assertive'
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
