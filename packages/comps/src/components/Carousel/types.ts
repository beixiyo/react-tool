/**
 * 轮播图组件类型定义
 */

/**
 * 轮播图组件引用对象类型
 * 通过 ref 可以程序化控制轮播图的切换
 */
export interface CarouselRef {
  /**
   * 跳转到指定索引
   * @param index - 目标图片的索引（从 0 开始）
   */
  goToIndex: (index: number) => void
  /**
   * 切换到下一张图片
   */
  next: () => void
  /**
   * 切换到上一张图片
   */
  prev: () => void
}

/**
 * 轮播图组件属性类型定义
 */
export type CarouselProps = {
  /**
   * 图片数组
   * 传入图片 URL 数组，组件会自动渲染轮播图
   */
  imgs?: string[]
  /**
   * 图片高度（像素）
   * 仅在未设置 aspectRatio 且 enableAutoHeight 为 false 时生效
   * @default 400
   */
  imgHeight?: number
  /**
   * 自动播放间隔（毫秒）
   * 设置为 0 或负数可禁用自动播放
   * @default 5000
   */
  autoPlayInterval?: number
  /**
   * 初始显示的图片索引（从 0 开始）
   * @default 0
   */
  initialIndex?: number
  /**
   * 是否显示左右导航箭头
   * @default true
   */
  showArrows?: boolean
  /**
   * 是否显示底部导航指示器（小圆点或线条）
   * @default true
   */
  showDots?: boolean
  /**
   * 是否显示预览图
   * 预览图会显示当前图片之后的几张图片缩略图
   * @default false
   */
  showPreview?: boolean
  /**
   * 预览图数量
   * 仅在 showPreview 为 true 时生效
   * @default 3
   */
  previewCount?: number
  /**
   * 预览图位置
   * - 'right': 显示在右侧（垂直排列）
   * - 'bottom': 显示在底部（水平排列）
   * @default 'right'
   */
  previewPosition?: 'right' | 'bottom'
  /**
   * 过渡动画类型
   * - 'slide': 滑动切换（默认）
   * - 'fade': 淡入淡出
   * - 'zoom': 缩放切换
   * @default 'slide'
   */
  transitionType?: 'slide' | 'fade' | 'zoom'
  /**
   * 动画持续时间（秒）
   * 控制切换动画的播放时长
   * @default 0.5
   */
  animationDuration?: number
  /**
   * 指示器类型
   * - 'dot': 圆点样式
   * - 'line': 线条样式
   * @default 'dot'
   */
  indicatorType?: 'dot' | 'line'
  /**
   * 是否启用滑动切换
   * 启用后可以通过触摸或鼠标拖拽切换图片
   * @default true
   */
  enableSwipe?: boolean
  /**
   * 是否启用键盘导航
   * 启用后可以使用方向键（← →）切换图片
   * @default true
   */
  enableKeyboardNav?: boolean
  /**
   * 是否自动调整高度
   * 启用后容器高度会根据内容自动调整
   * @default false
   */
  enableAutoHeight?: boolean
  /**
   * 鼠标悬停时是否暂停自动播放
   * 提升用户体验，悬停查看时不会自动切换
   * @default true
   */
  pauseOnHover?: boolean
  /**
   * 图片适配方式
   * - 'cover': 覆盖整个容器，可能裁剪图片
   * - 'contain': 完整显示图片，可能留白
   * - 'fill': 拉伸填充容器，可能变形
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill'
  /**
   * 图片宽高比（宽度/高度）
   * 设置后将自动维持该比例，容器高度会根据宽度自动计算
   * 例如：16:9 的比例为 16/9 ≈ 1.78，4:3 的比例为 4/3 ≈ 1.33
   * 优先级高于 imgHeight
   */
  aspectRatio?: number
  /**
   * 轮播图切换回调函数
   * 当图片切换时会触发此回调，参数为新图片的索引
   * @param index - 新图片的索引（从 0 开始）
   */
  onSlideChange?: (index: number) => void
  /**
   * 自定义内容
   * 可以传入 React 节点作为覆盖层，显示在图片上方
   * 常用于添加文字说明、按钮等交互元素
   */
  children?: React.ReactNode
  /**
   * 占位图 URL
   * 图片加载失败时显示的占位图
   */
  placeholderImage?: string
  /**
   * 预览图占位图 URL
   * 预览图加载失败时显示的占位图
   */
  previewPlaceholderImage?: string
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
