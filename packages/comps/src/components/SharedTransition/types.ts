/** 共享过渡的公共契约，不依赖新版 React 类型导出 */
import type { ComponentType, ReactNode } from 'react'

/** 应用级共享过渡协调器 */
export interface SharedTransitionProviderProps {
  children?: ReactNode
  /** 是否启用原生过渡；不影响显示和交互
   * @default true
   */
  enabled?: boolean
}

/** 状态切换时，与过渡状态在同一次更新中执行的业务更新 */
export interface SharedTransitionActionOptions {
  /** 同步调用；不要在此回调内执行异步工作 */
  update?: () => void
}

/** 单个配对在当前 Provider 中的状态和操作 */
export interface SharedTransitionState {
  /** 是否显示目标 */
  open: boolean
  /** React、浏览器支持且 Provider 启用时允许 VT */
  enabled: boolean
  /** 打开目标；来源子树在原生 VT 下隐藏并保留 React 状态 */
  show: (options?: SharedTransitionActionOptions) => void
  /** 关闭目标 */
  hide: (options?: SharedTransitionActionOptions) => void
}

/** 两端共同的配置；不增加 DOM 包装 */
export interface SharedTransitionEndpointProps {
  children?: ReactNode
  /** 是否参与共享配对；false 时仅保留独立的进入/退出过渡
   * @default true
   */
  shared?: boolean
}

/** 来源端的可选受控可见性，便于图库等外部状态所有者复用配对机制 */
export interface SharedTransitionSourceProps extends SharedTransitionEndpointProps {
  /** 是否隐藏来源子树；未传时跟随配对自身的 open 状态
   * @default undefined
   */
  hidden?: boolean
}

/** 静态配对凭证；状态、名称和 DOM 注册均隔离在 Provider 内 */
export interface SharedTransitionPair {
  /** 读取当前 Provider 内这一对的状态；必须遵守 Hook 调用规则 */
  useTransition: () => SharedTransitionState
  /** 来源端；打开时通过 Activity 隐藏子树，布局占位由调用方容器负责 */
  Source: ComponentType<SharedTransitionSourceProps>
  /** 目标端；应随 open 挂载/卸载，支持同一 React 树的 Portal */
  Target: ComponentType<SharedTransitionEndpointProps>
}
