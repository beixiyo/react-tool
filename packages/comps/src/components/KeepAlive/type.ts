export interface KeepAliveProps {
  children: React.ReactNode
  active: boolean
  /**
   * 是否在激活时强制刷新子组件（通过递增 renderKey 触发重新挂载）。
   * 用于解决 motion 等动画库在 Suspense 恢复后状态不重置的问题。
   * @default false
   */
  forceRender?: boolean
}

/**
 * {@link useKeepAliveEffect} 的回调
 *
 * 激活时执行，可返回一个在「失活（隐藏）/ 卸载」时调用的 cleanup（同 {@link useEffect} 约定）。
 */
export type KeepAliveEffectCallback = () => void | (() => void)

export interface KeepAliveContextType {
  registerActiveEffect: (key: keyof any, effectCallback: Function) => void
  registerDeactiveEffect: (key: keyof any, effectCallback: Function) => void

  findEffect: (key?: keyof any) => {
    activeEffect: Function[]
    deactiveEffect: Function[]
  }

  /** 传 callback 则只移除该回调；不传 callback 删除整个 key；不传 key 清空全部 */
  delActiveEffect: (key?: keyof any, callback?: Function) => void
  delDeactiveEffect: (key?: keyof any, callback?: Function) => void
}
