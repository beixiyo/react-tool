import type { RefObject } from 'react'

export type PageSwiperProps = {
  /**
   * 内容区域类名
   */
  contentClassName?: string
  /**
   * 是否显示预览模式，左右两侧留白能看到预览内容
   * @default false
   */
  showPreview?: boolean
  /**
   * 预览宽度
   * @default 100
   */
  previewWidth?: number

  /**
   * 当前页面索引
   * 传入时为受控模式，不传入时为非受控模式（默认从 0 开始）
   */
  index?: number
  /**
   * 初始页面索引
   * 仅在非受控模式下有效
   * @default 0
   */
  initialIndex?: number
  /**
   * 当页面切换时触发的回调
   */
  onIndexChange?: (index: number) => void
  /**
   * 滑动切换的阈值，相对于容器宽度的比例
   * @default 0.05
   */
  threshold?: number
  /**
   * 是否显示两侧切换按钮
   * @default false
   */
  showButtons?: boolean
  /**
   * 是否显示底部指示器
   * @default true
   */
  showIndicator?: boolean
  /**
   * 每个页面之间的间隔（像素）
   * @default 40
   */
  gap?: number
  /**
   * 组件引用对象
   */
  ref?: RefObject<PageSwiperRef | null>
  /**
   * 是否启用滚轮切换
   * @default false
   */
  enableWheel?: boolean
  /**
   * 是否启用方向键（ArrowLeft / ArrowRight）翻页
   * 焦点在输入框/可编辑区域时不会触发；监听范围见 `keyboardScope`
   * @default true
   */
  enableKeyboard?: boolean
  /**
   * 键盘翻页监听范围
   * - `global`：在 window 上响应，适合整页独占的翻页器
   * - `container`：仅焦点位于当前容器内时响应（容器可通过 Tab 聚焦），适合页面多实例
   * @default 'global'
   */
  keyboardScope?: 'global' | 'container'
} & React.ComponentPropsWithoutRef<'div'>

export type PageSwiperRef = {
  next: () => void
  prev: () => void
  goToIndex: (index: number) => void
  getCurrentIndex: () => number
  getChildrenLength: () => number
}
