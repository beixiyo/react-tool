/**
 * PhoneFrame 类型声明
 */

import type { ReactNode } from 'react'
/**
 * 手机外壳组件属性
 */
export interface PhoneFrameProps {
  /**
   * 组件整体缩放比例
   * @default 1
   */
  scale?: number
  /**
   * 内部内容
   */
  children: ReactNode
  /**
   * 自定义样式
   */
  className?: string
  /**
   * 是否显示状态栏
   * @default true
   */
  showStatusBar?: boolean
  /**
   * 是否显示Home指示器
   * @default true
   */
  showHomeIndicator?: boolean
}
