import type { StoreAPI } from './type'

/**
 * 使用 store
 * @param api - store 的 API 对象
 * @param selector - 选择器函数，用于从状态中提取需要的部分
 * @returns 通过选择器提取的状态部分
 */
export function useStore<S extends object, R>(
  api: StoreAPI<S>,
  selector: (state: S) => R,
): R {
  // const forceRefresh = useRefresh()

  /**
   * 手动触发更新，订阅每个组件
   * 当执行 setState 时，触发这里的更新，从而更新组件
   */
  // useEffect(() => {
  //   const listener = (state: S, prevState: S) => {
  //     const newObj = selector(state)
  //     const oldobj = selector(prevState)

  //     if (!isSame(newObj, oldobj)) {
  //       forceRefresh()
  //     }
  //   }

  //   return api.subscribe(listener)

  // }, [api, selector])

  // return selector(api.getState())

  /**
   * 使用内置 API 触发更新
   */
  function getState() {
    return selector(api.getState())
  }

  return useSyncExternalStore(api.subscribe, getState)
}
