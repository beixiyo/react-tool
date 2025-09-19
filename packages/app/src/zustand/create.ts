import type { CreateState } from './type'
import { createStore } from './createStore'
import { useStore } from './useStore'

/**
 * 创建一个绑定的 store
 * @param createState - 用于初始化状态的函数
 * @returns 包含 setState, getState, subscribe, destroy 方法的对象
 */
export function create<S extends object>(createState: CreateState<S>) {
  const api = createStore(createState)

  /**
   * 使用绑定的 store
   * @param selector - 选择器函数，用于从状态中提取需要的部分。
   * @returns 通过选择器提取的状态部分。
   */
  function useBoundStore<R>(selector: (state: S) => R): R {
    return useStore(api, selector)
  }

  return Object.assign(useBoundStore, api)
}
