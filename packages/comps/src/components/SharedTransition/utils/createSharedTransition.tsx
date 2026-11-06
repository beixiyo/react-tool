/** 创建模块级或实例级配对凭证；不在工厂闭包中保存应用状态 */
'use client'

import { memo } from 'react'
import { NativeActivity, NativeViewTransition, TRANSITION_CLASS } from '../adapters/react'
import { useEndpointRegistration, usePair } from '../hooks/context'
import type { SharedTransitionEndpointProps, SharedTransitionPair, SharedTransitionSourceProps } from '../types'

/**
 * 创建相互绑定的 Source、Target 和 useTransition
 *
 * 可在模块级创建，多次读取不会创建新配对
 * 同一 Provider 内重复的业务实例必须各自创建凭证
 */
export function createSharedTransition(): SharedTransitionPair {
  const token = Object.freeze({})

  const Source = memo(function SharedTransitionSource({
    children,
    shared = true,
    hidden,
  }: SharedTransitionSourceProps) {
    const { state, registration } = usePair(token)
    useEndpointRegistration(registration, 'source')

    if (!NativeViewTransition || !NativeActivity) return <>{ children }</>

    // 名称始终稳定；即使禁用动画也交接可见性，避免同时挂载同名边界
    return (
      <NativeActivity
        mode={ hidden ?? state.open
          ? 'hidden'
          : 'visible' }
      >
        <NativeViewTransition
          name={ registration.name }
          default="none"
          share={ state.enabled && shared
            ? TRANSITION_CLASS
            : 'none' }
        >
          { children }
        </NativeViewTransition>
      </NativeActivity>
    )
  })

  const Target = memo(function SharedTransitionTarget({
    children,
    shared = true,
  }: SharedTransitionEndpointProps) {
    const { state, registration } = usePair(token)
    useEndpointRegistration(registration, 'target')

    if (!NativeViewTransition) return <>{ children }</>

    // 不通过切换 name 关闭共享，React 的命名注册需保持稳定
    return (
      <NativeViewTransition
        name={ registration.name }
        default={ state.enabled
          ? TRANSITION_CLASS
          : 'none' }
        update="none"
        share={ state.enabled && shared
          ? TRANSITION_CLASS
          : 'none' }
      >
        { children }
      </NativeViewTransition>
    )
  })

  return Object.freeze({
    Source,
    Target,
    useTransition: () => usePair(token).state,
  })
}
