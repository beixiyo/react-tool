import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'

/** 视口坐标系位置，对应 position: fixed 的 left/top */
export type DragPosition = {
  x: number
  y: number
}

export type UseDragPositionOptions = {
  /**
   * 被拖动的元素：首次拖动以其当前渲染位置为基准，并按其尺寸做视口 clamp
   */
  targetRef: RefObject<HTMLElement | null>

  /**
   * 初始位置；不提供时 position 为 null，
   * 由调用方用自己的方式定位（如 CSS 类 right-0 top-0），首次拖动时无缝接管
   */
  initialPosition?: DragPosition | null

  /**
   * 位置 clamp 后元素与视口边缘保持的最小距离（像素）
   * @default 0
   */
  boundaryPadding?: number

  /**
   * 按下后位移超过该距离（像素）才进入拖动，
   * 避免把手内按钮的普通点击被误判为拖拽
   * @default 4
   */
  startThreshold?: number

  /**
   * 是否禁用拖拽
   * @default false
   */
  disabled?: boolean
}

export type UseDragPositionReturn = {
  /** 当前位置；null 表示从未拖动，调用方应使用自己的默认定位 */
  position: DragPosition | null

  /** 是否处于拖动中（已越过启动阈值） */
  isDragging: boolean

  /** 展开到拖拽把手上的指针事件 */
  handleProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  }

  /** 丢弃当前位置：position 回到 initialPosition（默认 null），调用方恢复默认定位 */
  reset: () => void
}
