import type { CreateState, StoreAPI } from './type'
import { isFn, isObj, isSame } from '@jl-org/tool'

export function createStore<S extends object>(createState: CreateState<S>) {
  let state: S
  const listeners = new Set<(state: S, prevState: S) => void>()

  /**
   * 更新状态，触发监听
   * @param partial - 新的状态或一个返回新状态的函数
   * @param replace - 是否替换当前状态而不是合并
   */
  const setState: StoreAPI<S>['setState'] = (partial, replace = false) => {
    const nextState = isFn(partial)
      ? partial(state)
      : partial

    if (!isSame(nextState, state)) {
      const previousState = state

      if (!replace) {
        state = !isObj(nextState)
          ? nextState
          : { ...state, ...nextState }
      }
      else {
        state = nextState as any
      }

      listeners.forEach(listener => listener(state, previousState))
    }
  }

  const getState: StoreAPI<S>['getState'] = () => state

  /**
   * 订阅状态变化
   * @param listener - 当状态变化时调用的函数
   * @returns 取消订阅的函数
   */
  const subscribe: StoreAPI<S>['subscribe'] = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  /**
   * 销毁 store，移除所有监听器
   */
  const destroy: StoreAPI<S>['destroy'] = () => {
    listeners.clear()
  }

  const api: StoreAPI<S> = { setState, getState, subscribe, destroy }
  state = createState(setState, getState, api)

  return api
}
