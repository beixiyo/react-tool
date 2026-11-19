export interface ClickOutsideOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean

  /**
   * 事件类型
   * @default mousedown
   */
  trigger?: 'click' | 'mousedown' | 'pointerdown' | 'contextmenu'

  /**
   * 额外的 CSS 选择器，用于检测点击是否在这些元素内部
   * 主要用于处理固定定位的面板等场景
   * @default []
   */
  additionalSelectors?: string[]

  /**
   * 是否在捕获阶段监听；目标元素内部 stopPropagation 时仍需感知外部点击可开启
   * @default false
   */
  capture?: boolean

  /**
   * 额外的忽略判断，返回 `true` 时视为内部点击、不触发处理函数
   *
   * 每次事件触发时读取最新值，可写成内联函数
   */
  ignore?: (target: Node, event: MouseEvent) => boolean
}

export interface ScrollBottomOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
  /**
   * 启动平滑滚动，可能造成无法滚动到底
   * @default false
   */
  smooth?: boolean
  /**
   * 延迟时间
   * @default 0
   */
  delay?: number
}

export interface ScrollReachBottomOpts {
  /**
   * 触底阈值（像素）
   * @default 50
   */
  threshold?: number
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
}

export type InsertStyleOpts = {
  enable?: boolean
  lightStyleStrOrUrl?: string
  darkStyleStrOrUrl?: string
}
