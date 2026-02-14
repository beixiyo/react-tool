export interface KeepAliveProps {
  children: React.ReactNode
  active: boolean
  /**
   * 是否在激活时强制刷新子组件（通过递增 renderKey 触发重新挂载）。
   * 用于解决 framer-motion 等动画库在 Suspense 恢复后状态不重置的问题。
   * @default false
   */
  forceRender?: boolean
}

export interface KeepAliveContextType {
  registerActiveEffect: (key: keyof any, effectCallback: Function) => void
  registerDeactiveEffect: (key: keyof any, effectCallback: Function) => void

  findEffect: (key?: keyof any) => {
    activeEffect: Function[]
    deactiveEffect: Function[]
  }

  delActiveEffect: (key?: keyof any) => void
  delDeactiveEffect: (key?: keyof any) => void
}
