import type { KeepAliveContextType } from './type'
import { createContext } from 'react'

/**
 * 创建一个相互隔离的 keep-alive 激活 / 失活回调注册表
 *
 * 每个 KeepAliveProvider 持有独立实例 → 不同 Provider 之间即便产生同名 uniqueKey
 * 也不会互相串扰（修复模块级全局单例导致的跨实例污染）
 * 同一 key 下用 Set 收集多个回调，删除时按回调引用精确移除，避免误删同 key 的其它回调
 */
export function createKeepAliveRegistry(): KeepAliveContextType {
  const activeEffectMap = new Map<keyof any, Set<Function>>()
  const deactiveEffectMap = new Map<keyof any, Set<Function>>()

  const remove = (map: Map<keyof any, Set<Function>>, key?: keyof any, callback?: Function) => {
    if (!key) {
      map.clear()
      return
    }
    if (callback) {
      const set = map.get(key)
      set?.delete(callback)
      if (set && !set.size)
        map.delete(key)
    }
    else {
      map.delete(key)
    }
  }

  const add = (map: Map<keyof any, Set<Function>>, key: keyof any, callback: Function) => {
    const set = map.get(key) ?? new Set<Function>()
    set.add(callback)
    map.set(key, set)
  }

  return {
    findEffect: key => ({
      activeEffect: key
        ? [...(activeEffectMap.get(key) ?? [])]
        : [],
      deactiveEffect: key
        ? [...(deactiveEffectMap.get(key) ?? [])]
        : [],
    }),

    delActiveEffect: (key, callback) => remove(activeEffectMap, key, callback),
    delDeactiveEffect: (key, callback) => remove(deactiveEffectMap, key, callback),

    registerActiveEffect: (key, callback) => add(activeEffectMap, key, callback),
    registerDeactiveEffect: (key, callback) => add(deactiveEffectMap, key, callback),
  }
}

/** createContext 默认值：组件未被 KeepAliveProvider 包裹时的兜底注册表 */
export const KeepAliveContext = createContext<KeepAliveContextType>(createKeepAliveRegistry())
