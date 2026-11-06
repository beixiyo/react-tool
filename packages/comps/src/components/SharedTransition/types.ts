/** 共享过渡的公共契约，不依赖新版 React 类型导出 */
import type { ComponentType, CSSProperties, ReactNode } from 'react'

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
  isOpen: boolean
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
  /** 是否隐藏来源子树；未传时跟随配对自身的 isOpen 状态
   * @default undefined
   */
  hidden?: boolean
}

/** 创建配对时的静态配置 */
export interface CreateSharedTransitionOptions {
  /** 连续变形预设：整块快照缩放、圆角裁剪及分阶段内容交接；true 使用默认参数
   * @default true
   */
  morph?: boolean | SharedTransitionMorphOptions
  /** 额外的原生过渡样式类；启用 morph 时不需要自行编写样式
   * @default 'vv-shared-transition'（未启用 morph 时）
   */
  transitionClass?: string
}

/** 连续变形预设的可选覆盖参数；时长单位为毫秒，圆角单位为 CSS 像素 */
export interface SharedTransitionMorphOptions {
  /** 展开与收起时长
   * @default { open: 520, close: 420 }
   */
  duration?: { open?: number; close?: number }
  /** 几何变换与圆角的 CSS 缓动函数
   * @default 'cubic-bezier(0.2, 0.85, 0.2, 1)'
   */
  easing?: CSSProperties['animationTimingFunction']
  /** 来源圆角
   * @default 20
   */
  sourceRadius?: number
  /** 目标圆角
   * @default 16
   */
  targetRadius?: number
  /** 内容淡化时保持实心的表面颜色
   * @default 'rgb(var(--background))'
   */
  background?: CSSProperties['backgroundColor']
}

/** 静态配对凭证；状态、名称和 DOM 注册均隔离在 Provider 内 */
export interface SharedTransitionPair {
  /** 读取当前 Provider 内这一对的状态；必须遵守 Hook 调用规则 */
  useTransition: () => SharedTransitionState
  /** 来源端；打开时通过 Activity 隐藏子树，布局占位由调用方容器负责 */
  Source: ComponentType<SharedTransitionSourceProps>
  /** 目标端；应随 isOpen 挂载/卸载，支持同一 React 树的 Portal */
  Target: ComponentType<SharedTransitionEndpointProps>
}
