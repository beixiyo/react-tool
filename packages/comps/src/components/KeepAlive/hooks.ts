import type { KeepAliveContextType, KeepAliveEffectCallback } from './type'
import { useContext, useEffect, useRef } from 'react'
import { KeepAliveContext, KeepAliveKeyContext } from './context'

/**
 * ## 必须在 KeepAlive 组件传递 uniqueKey 属性才能使用
 * 注册激活回调
 */
export const useActiveEffect: KeepAliveContextType['registerActiveEffect'] = (key, callback) => {
  const { registerActiveEffect, delActiveEffect } = useContext(KeepAliveContext)

  useEffect(() => {
    registerActiveEffect?.(key, callback)

    return () => {
      delActiveEffect?.(key, callback)
    }
  }, [])
}

/**
 * ## 必须在 KeepAlive 组件传递 uniqueKey 属性才能使用
 * 注册失活回调
 */
export const useDeactiveEffect: KeepAliveContextType['registerDeactiveEffect'] = (key, callback) => {
  const { registerDeactiveEffect, delDeactiveEffect } = useContext(KeepAliveContext)

  useEffect(() => {
    registerDeactiveEffect?.(key, callback)

    return () => {
      delDeactiveEffect?.(key, callback)
    }
  }, [])
}

/**
 * KeepAlive 可见性感知 effect —— {@link useEffect} 的缓存版
 *
 * - 页面**激活**（首次挂载即可见，或 keep-alive 由隐藏切回）时执行 `effect`
 * - 页面**失活**（被缓存隐藏）或**卸载**时执行 `effect` 返回的 cleanup
 *
 * 解决「缓存页用普通 `useEffect`，cleanup 只在真卸载时跑、隐藏时不触发」导致的副作用 /
 * 当前页信号残留。自动经 {@link KeepAliveKeyContext} 解析所属缓存单元，无需手动传 key；
 * 未被 KeepAlive 包裹时退化为普通 effect（挂载执行、卸载清理）。
 *
 * 内部用 ref 始终调用最新闭包，无 stale 问题，故不需要依赖数组。
 *
 * @example
 * useKeepAliveEffect(() => {
 *   reportActiveSurface(true)
 *   return () => reportActiveSurface(false) // 隐藏 / 卸载都会复位
 * })
 */
export function useKeepAliveEffect(effect: KeepAliveEffectCallback): void {
  const key = useContext(KeepAliveKeyContext)
  const {
    registerActiveEffect,
    registerDeactiveEffect,
    delActiveEffect,
    delDeactiveEffect,
  } = useContext(KeepAliveContext)

  const effectRef = useRef(effect)
  effectRef.current = effect
  const cleanupRef = useRef<ReturnType<KeepAliveEffectCallback>>(undefined)

  useEffect(() => {
    /** 幂等开关：避免「mount 自跑」与 KeepAlive 同一 tick 的 activeEffect 重复执行 */
    let running = false

    const activate = () => {
      if (running)
        return
      running = true
      cleanupRef.current = effectRef.current()
    }
    const deactivate = () => {
      if (!running)
        return
      running = false
      cleanupRef.current?.()
      cleanupRef.current = undefined
    }

    /** 未被 KeepAlive 包裹：退化为普通 effect（挂载执行、卸载清理） */
    if (key === undefined) {
      activate()
      return deactivate
    }

    registerActiveEffect(key, activate)
    registerDeactiveEffect(key, deactivate)

    /**
     * 组件只会在「页面激活时」挂载（隐藏时整棵子树被 Suspense 挂起、不挂载），故挂载即激活：
     * 主动跑一次。这样晚于 KeepAlive 初次 activeEffect 挂载的后代也能拿到初次激活；
     * 与同 tick 的 activeEffect 由 `running` 幂等去重，不会重复执行。
     */
    activate()

    return () => {
      delActiveEffect(key, activate)
      delDeactiveEffect(key, deactivate)
      deactivate()
    }
  }, [key, registerActiveEffect, registerDeactiveEffect, delActiveEffect, delDeactiveEffect])
}
