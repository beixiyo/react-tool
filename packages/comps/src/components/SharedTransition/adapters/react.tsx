/** 新 API 的动态访问与浏览器能力检测，旧 React 不产生缺失的命名导入 */
import * as React from 'react'
import type { ComponentType, ReactNode } from 'react'

export const NativeViewTransition = Reflect.get(React, 'ViewTransition') as ComponentType<NativeBoundaryProps> | undefined

export const NativeActivity = Reflect.get(React, 'Activity') as
  | ComponentType<{
    children?: ReactNode
    mode: 'hidden' | 'visible'
  }>
  | undefined

/** 仅检查 React 与浏览器的原生过渡能力 */
export function getTransitionSupported() {
  return Boolean(
    NativeViewTransition
      && NativeActivity
      && typeof document !== 'undefined'
      && typeof document.startViewTransition === 'function',
  )
}

/** SSR 不启用动画，hydration 后再读取客户端能力 */
export const getServerTransitionSupported = () => false

export const TRANSITION_CLASS = 'vv-shared-transition'

interface NativeBoundaryProps {
  children?: ReactNode
  name?: string
  default?: string
  enter?: string
  exit?: string
  update?: string
  share?: string
}
