/** 应用级配对状态、注册记录及其生命周期的协调 */
'use client'

import { memo, startTransition, useCallback, useInsertionEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { getServerTransitionSupported, getTransitionSupported } from './adapters/react'
import { SharedTransitionContext } from './hooks/context'
import type { PairRegistration } from './hooks/context'
import type { SharedTransitionActionOptions, SharedTransitionProviderProps } from './types'

/** 能力无需动态订阅；保留 external store 的 SSR / hydration 快照语义 */
const subscribeTransitionSupport = () => () => {}

/**
 * 为任意多组工厂凭证提供隔离状态
 * 多 React root 的应用应为各 root 设置不同的 identifierPrefix
 */
export const SharedTransitionProvider = memo(function SharedTransitionProvider({
  children,
  enabled = true,
}: SharedTransitionProviderProps) {
  const supported = useSyncExternalStore(
    subscribeTransitionSupport,
    getTransitionSupported,
    getServerTransitionSupported,
  )
  const active = enabled && supported
  const [states, setStates] = useState(() => new Map<object, boolean>())
  // 放弃的并发渲染不会运行 effect；弱键让未提交的实例凭证仍能被回收
  const [registry] = useState(() => new WeakMap<object, PairRegistration>())
  const mounted = useRef(true)

  useInsertionEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const change = useCallback((token: object, isOpen: boolean, options?: SharedTransitionActionOptions) => {
    const update = () => {
      options?.update?.()
      setStates((previous) => {
        if ((previous.get(token) ?? false) === isOpen) return previous
        const next = new Map(previous)
        next.set(token, isOpen)
        return next
      })
    }

    // 使用 React state 而非 external store，保留 Transition lane
    if (active) startTransition(update)
    else update()
  }, [active])

  const release = useCallback((token: object) => {
    if (!mounted.current) return
    setStates((previous) => {
      if (!previous.has(token)) return previous
      const next = new Map(previous)
      next.delete(token)
      return next
    })
  }, [])

  const value = useMemo(() => ({
    registry,
    states,
    enabled: active,
    change,
    release,
  }), [registry, states, active, change, release])

  return <SharedTransitionContext.Provider value={ value }>{ children }</SharedTransitionContext.Provider>
})
