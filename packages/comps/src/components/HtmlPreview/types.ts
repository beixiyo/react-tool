import type { ReactNode } from 'react'
import type { MoveableProps } from '../Moveable'

type MoveableConfig = Pick<
  MoveableProps,
  | 'canDrag'
  | 'canRotate'
  | 'canResize'
  | 'showBorder'
  | 'color'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'lockAspectRatio'
  | 'disabled'
  | 'onPositionChange'
  | 'onResize'
  | 'onRotate'
  | 'onTransformEnd'
>

export type HtmlPreviewProps = MoveableConfig & {
  /**
   * HTML内容
   */
  html: string
  /**
   * 预览窗口的标题，可传 ReactNode 自定义标题区
   * @default 'HTML Preview'
   */
  title?: ReactNode
  /**
   * 内容溢出时的滚动行为
   * @default 'auto'
   */
  overflow?: 'hidden' | 'auto' | 'scroll' | 'visible'
  /**
   * 是否显示控制栏
   * @default true
   */
  showControls?: boolean
  /**
   * iframe 的 sandbox 属性，按需放开/收紧权限
   * @default 'allow-scripts'
   */
  sandbox?: string
  /**
   * 控制栏高度（像素），仅在 showControls 为 true 时生效
   * @default 40
   */
  headerHeight?: number
  /**
   * 控制栏自定义类名
   */
  headerClassName?: string
  /**
   * 控制栏右侧额外操作区（渲染在刷新/展开按钮之前）
   */
  headerActions?: ReactNode
  /**
   * 点击刷新按钮的回调
   */
  onRefresh?: () => void
  /**
   * 切换展开/收起的回调
   * @param expanded 切换后的展开状态
   */
  onToggleExpand?: (expanded: boolean) => void
  /**
   * 是否可拖动
   * @default true
   */
  draggable?: boolean
  /**
   * 初始位置
   */
  initialPosition?: {
    x?: number
    y?: number
    rotation?: number
  }
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
