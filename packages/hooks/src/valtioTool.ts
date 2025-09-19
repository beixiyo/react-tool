import type { Snapshot } from 'valtio'
import { deepClone } from '@jl-org/tool'
import { proxy, useSnapshot } from 'valtio'
import { onUnmounted } from './lifecycle'

/**
 * 创建带有重置状态的 valtio store
 * @example
 * export const countStore = createProxy({ count: 0 })
 *
 * // 组件里使用
 * const store = countStore.use()
 * const reset = countStore.reset
 * const getInitState = countStore.getInitState
 * const dispose = countStore.dispose
 */
export function createProxy<T extends object>(initState: ExcludeProps & T) {
  const getInitState = () => deepClone(initState) as T
  const store = proxy(getInitState())

  const reset = (key?: keyof T, initState?: Partial<T>) => {
    const rawData = initState || getInitState()
    const whiteList: InternalMethods[] = ['use', 'useAndDispose', 'reset', 'dispose', 'getInitState']

    // @ts-ignore
    if (key && key in store && !whiteList.includes(key)) {
      // @ts-ignore
      store[key] = rawData[key]
      return
    }

    Object.keys(store).forEach((k) => {
      // @ts-ignore
      if (whiteList.includes(k) || !(k in rawData))
        return

      // @ts-ignore
      store[k] = rawData[k]
    })
  }

  const use = (options?: Options) => useSnapshot(store, options)
  const dispose = (initState?: Partial<T>) => onUnmounted(() => reset(undefined, initState))
  const useAndDispose = (options?: Options) => (dispose(), use(options))

  const tools: Tool<T> = {
    use,
    useAndDispose,

    reset,
    dispose,
    getInitState,
  }

  return Object.assign(store, tools)
}

export type InternalMethods = keyof Tool<any>
type Options = Parameters<typeof useSnapshot>[1]

export interface Tool<T = any> {
  /**
   * @param key 要重置的单个 key
   * @param initState 重置的初始状态
   * 重置 store 状态
   */
  reset: (key?: keyof T, initState?: Partial<T>) => void
  /**
   * 在组件中获取 store 状态
   */
  use: (options?: Options) => Snapshot<T>
  /**
   * 在组件中获取 store 状态 并且 在组件销毁时重置 store
   */
  useAndDispose: (options?: Options) => Snapshot<T>
  /**
   * 获取 store 的初始状态
   */
  getInitState: () => T
  /**
   * 在组件销毁时重置 store
   */
  dispose: (initState?: Partial<T>) => void
}

type ExcludeProps = {
  [K in keyof Tool]?: never
}
