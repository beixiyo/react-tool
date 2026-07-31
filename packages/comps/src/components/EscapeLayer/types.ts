/**
 * Escape 浮层注册选项
 */
export interface UseEscapeLayerOptions {
  /** 当前层是否进入 Escape 响应栈 */
  open: boolean
  /** Escape 触发时执行 */
  onEscape?: (event: KeyboardEvent) => void
  /**
   * 是否允许 Escape 执行 `onEscape`
   *
   * 关闭时仍会占据栈顶，避免 Escape 穿透到下层
   * @default true
   */
  dismissible?: boolean
  /**
   * 是否消费 Escape，阻止默认行为和后续冒泡
   * @default true
   */
  consume?: boolean
}

/**
 * Escape 浮层控制器
 */
export interface EscapeLayerController {
  /** 当前实例是否位于 Escape 响应栈顶 */
  isTopLayer: boolean
}
