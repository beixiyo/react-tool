/** 键盘交互层注册选项 */
export interface UseKeyboardLayerOptions {
  /** 当前层是否进入键盘响应栈 */
  active: boolean
  /** 匹配的 `KeyboardEvent.key`；不传时匹配所有按键 */
  keys?: readonly string[]
  /** 是否要求 Ctrl 键处于指定状态；省略时不限制 */
  ctrlKey?: boolean
  /** 是否要求 Shift 键处于指定状态；省略时不限制 */
  shiftKey?: boolean
  /** 是否要求 Alt 键处于指定状态；省略时不限制 */
  altKey?: boolean
  /** 是否要求 Meta 键处于指定状态；省略时不限制 */
  metaKey?: boolean
  /** 进一步限制按键、组合键或事件目标 */
  when?: (event: KeyboardEvent) => boolean
  /**
   * 层级优先级；数值更大的活动层优先，同优先级按最近激活顺序处理
   * @default 0
   */
  priority?: number
  /** 当前层处理匹配事件时执行 */
  onKeyDown?: (event: KeyboardEvent) => void
  /**
   * 是否允许执行 `onKeyDown`
   *
   * 关闭时仍占据栈顶并可消费事件，避免穿透到下层
   * @default true
   */
  handlerEnabled?: boolean
  /**
   * 是否响应长按产生的重复 keydown；关闭时重复事件仍会被消费
   * @default true
   */
  allowRepeat?: boolean
  /**
   * 是否消费匹配事件，阻止默认行为和后续传播
   * @default true
   */
  consume?: boolean
}

/** 键盘交互层控制器 */
export interface KeyboardLayerController {
  /** 当前实例是否位于键盘响应栈顶 */
  isTopLayer: boolean
}
