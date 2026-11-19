import type { ReactNode } from 'react'

/** CustomSuspense 组件属性 */
export interface CustomSuspenseProps {
  children?: ReactNode
  /**
   * 子树挂起时展示的占位，如骨架屏
   * @default <Loading loading />
   */
  fallback?: ReactNode
}
