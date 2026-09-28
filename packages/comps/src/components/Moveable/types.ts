/**
 * Moveable 类型声明
 */

export interface MoveablePosition {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

/**
 * Moveable 命令式句柄，通过 ref 获取
 */
export interface MoveableRef {
  /** 读取当前的变换状态（位置 / 尺寸 / 旋转 / 缩放） */
  getPosition: () => MoveablePosition
  /** 程序化设置变换状态，仅传入需要覆盖的字段 */
  setPosition: (next: Partial<MoveablePosition>) => void
  /** 重置到初始位置（保留首次测量得到的宽高） */
  reset: () => void
}

export type MoveableProps =
  & {
    initialPosition?: Partial<Omit<MoveablePosition, 'width' | 'height' | 'scaleX' | 'scaleY'>>

    onPositionChange?: (x: number, y: number) => void
    onResize?: (width: number, height: number, scaleX: number, scaleY: number) => void
    onRotate?: (rotation: number) => void
    onTransformEnd?: (position: MoveablePosition) => void

    /**
     * 操作状态变化回调
     * @param isTransforming 是否正在进行变换操作（拖拽/缩放/旋转）
     */
    onTransformStateChange?: (isTransforming: boolean) => void

    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    /**
     * 用谁地大小当作父元素，默认父元素
     * @default 'parent'
     */
    viewport?: 'parent' | 'window'

    /**
     * 能否拖动到父元素之外
     */
    canDragOutside?: boolean
    lockAspectRatio?: boolean
    disabled?: boolean

    /**
     * 是否允许拖动
     * @default true
     */
    canDrag?: boolean

    /**
     * 是否允许旋转
     * @default true
     */
    canRotate?: boolean

    /**
     * 是否允许调整大小
     * @default true
     */
    canResize?: boolean

    /**
     * 是否显示边框
     * @default false
     */
    showBorder?: boolean

    /**
     * 主题颜色
     * @default 'rgb(var(--systemGreen) / 1)'
     */
    color?: string
  }
  & Omit<
    React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>,
    'onResize'
  >
