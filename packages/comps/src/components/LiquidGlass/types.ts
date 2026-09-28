import type * as React from 'react'
import type { Rounded, Size } from '../../types'

export type LiquidGlassBaseProps = {
  /**
   * 背景模糊程度
   * @default 'sm'
   */
  blur?: 'none' | Size
  /**
   * 透明度层的不透明度
   * @default 0.25
   */
  tintOpacity?: number
  /**
   * 发光强度
   * @default 'normal'
   */
  glowIntensity?: 'none' | 'light' | 'normal' | 'intense'
  /**
   * Tailwind 边框圆角
   * @default 'lg'
   */
  rounded?: Rounded
  /**
   * 是否启用悬停缩放效果
   * @default false
   */
  hoverScale?: boolean
  /**
   * 边框透明度
   * @default 0.3
   */
  borderOpacity?: number
  /**
   * 内容层文字样式类名，用于在不同背景下调整文字颜色/字重
   * @default 'text-black font-semibold'
   */
  contentClassName?: string
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
export type LiquidGlassBackgroundProps = {
  /**
   * 背景图片URL
   * @default 'https://www.publicdomainpictures.net/pictures/610000/velka/seamless-floral-wallpaper-art-1715193626Gct.jpg'
   */
  backgroundImage?: string
  /**
   * 背景图片大小
   * @default '500px'
   */
  backgroundSize?: string
  /**
   * 动画持续时间
   * @default '60s'
   */
  animationDuration?: string
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
export type LiquidGlassButtonProps = {
  /**
   * 按钮大小
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * 点击事件
   */
  onClick?: () => void
  /**
   * 链接地址
   */
  href?: string
  /**
   * 链接打开方式
   * @default '_blank'
   */
  target?: string
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
export type LiquidGlassDockProps = {
  /**
   * 应用程序列表
   * @default []
   */
  apps?: Array<{
    name: string
    icon: string
  }>
  /**
   * 应用程序点击事件
   */
  onAppClick?: (app: { name: string; icon: string }, index: number) => void
  /**
   * 链接地址
   */
  href?: string
  /**
   * 链接打开方式
   * @default '_blank'
   */
  target?: string
} & React.HTMLAttributes<HTMLDivElement>
export type LiquidGlassMenuProps = {
  /**
   * 菜单项列表
   * @default []
   */
  items?: string[]
  /**
   * 菜单项点击事件
   */
  onItemClick?: (item: string, index: number) => void
  /**
   * 菜单项样式类名
   */
  itemClassName?: string
} & React.HTMLAttributes<HTMLDivElement>
