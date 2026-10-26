import type { ReactNode } from 'react'

export interface CusotmSuspenseProps {
  children?: ReactNode
  /**
   * 子树挂起时展示的占位，如骨架屏
   * @default <Loading loading />
   */
  fallback?: ReactNode
}
