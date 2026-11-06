/** Provider 内部注册表：凭证只作键，不在模块全局保存可变状态 */
import { createContext, useContext, useId, useInsertionEffect, useMemo } from 'react'
import type { SharedTransitionActionOptions, SharedTransitionState } from '../types'

export const SharedTransitionContext = createContext<TransitionContext | null>(null)

/** 按代码点无损编码，生成合法 CSS 标识符，避免删除符号造成碰撞 */
function encodeName(value: string) {
  return 'vv-st-' + Array.from(value, (char) => char.codePointAt(0)!.toString(16)).join('-')
}

/** 工厂的 Hook 与两端读取同一个 Provider 内的配对记录 */
export function usePair(token: object) {
  const context = useContext(SharedTransitionContext)
  const id = useId()

  if (!context) {
    throw new Error('Shared transition components must be rendered within a SharedTransitionProvider')
  }

  let entry = context.registry.get(token)
  if (!entry) {
    entry = { name: encodeName(id), users: 0, source: new Set(), target: new Set() }
    context.registry.set(token, entry)
  }

  const registration = entry
  const { registry, release, change, enabled, states } = context

  // VT 会延迟 passive effect；在提交阶段计数，避免来源先卸载时误回收尚未连接 effect 的目标
  // 此处不读取 DOM，也不直接调度状态更新
  useInsertionEffect(() => {
    registration.users++

    return () => {
      registration.users--

      // StrictMode 重连和同次提交中的端点交接完成后再回收
      queueMicrotask(() => {
        if (registration.users === 0 && registry.get(token) === registration) {
          registry.delete(token)
          release(token)
        }
      })
    }
  }, [registration, registry, release, token])

  const open = states.get(token) ?? false

  const actions = useMemo(() => ({
    show: (options?: SharedTransitionActionOptions) => change(token, true, options),
    hide: (options?: SharedTransitionActionOptions) => change(token, false, options),
  }), [change, token])

  const state = useMemo<SharedTransitionState>(() => ({
    open,
    enabled,
    ...actions,
  }), [open, enabled, actions])

  return { state, registration }
}

/** 同一个凭证每种端点只允许一个实例；不同凭证及 Provider 不互相影响 */
export function useEndpointRegistration(entry: PairRegistration, role: 'source' | 'target') {
  const id = useId()

  useInsertionEffect(() => {
    const endpoints = entry[role]
    if (endpoints.size > 0 && !endpoints.has(id)) {
      throw new Error(`A shared transition pair cannot register more than one ${role}; create a separate pair for each instance`)
    }
    endpoints.add(id)

    return () => {
      endpoints.delete(id)
    }
  }, [entry, role, id])
}

export interface PairRegistration {
  name: string
  users: number
  source: Set<string>
  target: Set<string>
}

export interface TransitionContext {
  registry: WeakMap<object, PairRegistration>
  states: Map<object, boolean>
  enabled: boolean
  change: (token: object, open: boolean, options?: SharedTransitionActionOptions) => void
  release: (token: object) => void
}
