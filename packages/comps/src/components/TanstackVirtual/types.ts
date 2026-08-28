import type { TargetAndTransition, Transition } from 'motion/react'
import type { HTMLAttributes, ReactNode, Ref } from 'react'

/**
 * 通用动态高度虚拟列表属性（TanStack Virtual 内核）
 *
 * 组件自身即滚动容器，必须通过 className/style 给定高度上限
 * （如 `h-full`、`max-h-[400px]`），否则虚拟化不生效
 */
export type TanstackVirtualListProps<T> = {
  /** 要渲染的数据数组 */
  data: T[]

  /**
   * 渲染每个项目的函数
   *
   * 注意：项与项之间的间距必须用 padding 实现，
   * margin 不参与高度测量，会导致滚动漂移
   */
  children: (item: T, index: number) => ReactNode

  /**
   * 行 key 提取，虚拟行复用与测量缓存都依赖它的稳定性
   * @default item => item.id ?? index
   */
  getItemKey?: (item: T, index: number) => string | number

  /**
   * 每项预估高度（px），首次渲染后会自动测量校正，给个接近值即可
   * @default 64
   */
  estimateSize?: number

  /**
   * 可视区上下额外预渲染的项数，越大滚动越平滑、开销越高
   * @default 5
   */
  overscan?: number

  /**
   * 可选的虚拟行布局动画
   *
   * 开启后由虚拟列表负责滚动坐标和测量，Motion 负责数据增删、换序产生的
   * 可见行位移动画；只动画已挂载的可见行和 overscan 行
   * @default undefined
   */
  layoutAnimation?: VirtualListLayoutAnimationOptions<T>

  /**
   * 测量时直接复用缓存尺寸，完全跳过 DOM 测量
   * 仅在列表会被 display: none 隐藏、需防止 ResizeObserver 把高度重置为 0 时开启；
   * 开启后项的运行时高度变化（展开、图片加载等）将不再被感知
   * @default false
   */
  useCachedMeasurements?: boolean

  /** 行容器类名，函数形式可按行定制（选中态、分割线等） */
  itemClassName?: string | ((item: T, index: number) => string | undefined)

  /** 行点击回调 */
  onItemClick?: (item: T, index: number) => void

  /**
   * 是否还有更多数据，配合 loadMore 实现无限加载
   * @default false
   */
  hasMore?: boolean

  /** 加载更多数据的回调函数，滚动到末尾时触发 */
  loadMore?: () => Promise<any>

  /**
   * 距末尾还剩多少项时提前触发 loadMore
   * @default 0
   */
  endReachedRemain?: number

  /**
   * loadMore 进行中是否展示底部 loading
   * @default true
   */
  showLoading?: boolean

  /**
   * 挂载后立即触发一次 loadMore（用于数据为空时拉首屏）
   * @default false
   */
  immediate?: boolean

  /** 可视行范围变化回调（含 overscan），供上层做分组级加载等编排 */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void

  /** 列表底部固定内容（不参与虚拟化） */
  footer?: ReactNode

  /** 数据为空且非 loading 时渲染的空态内容 */
  empty?: ReactNode

  /** 内容容器类名（总高度撑开层） */
  contentClassName?: string

  /** 滚动容器元素 ref（滚动位置保存/恢复等场景） */
  scrollRef?: Ref<HTMLDivElement>

  /** 命令式控制 ref：按索引滚动（搜索跳转、定位到某项等） */
  listRef?: Ref<TanstackVirtualListRef>
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

/**
 * 虚拟列表的命令式接口
 *
 * 动态高度下「第 N 项在哪个偏移」只有 virtualizer 知道：未渲染项是估算值，
 * 滚到附近重测后还会自行校正。故必须由组件内部提供，外部算不出来
 */
export type TanstackVirtualListRef = {
  /** 滚动到指定索引；align 默认 'auto'（已在视口内则不动） */
  scrollToIndex: (index: number, options?: VirtualScrollToOptions) => void
  /** 滚动到指定像素偏移 */
  scrollToOffset: (offset: number, options?: VirtualScrollToOptions) => void
}

/** 滚动定位选项（对齐 TanStack Virtual 的 ScrollToOptions） */
export type VirtualScrollToOptions = {
  /** @default 'auto' */
  align?: 'start' | 'center' | 'end' | 'auto'
  /** @default 'auto' */
  behavior?: 'auto' | 'smooth'
}

/**
 * 通用虚拟行布局动画配置
 *
 * 虚拟列表固定使用 `layout="position"`，避免动态高度卡片在换序时被缩放
 */
export type VirtualListLayoutAnimationOptions<T> = {
  /** 跨 key 或跨分组移动时使用的 Motion layoutId */
  getLayoutId?: (item: T, index: number) => string | undefined
  /**
   * 返回该行关联的常驻动画锚点 key
   *
   * 锚点行应返回自身 key；与它关联的数据行会放入同一个不参与测量的
   * 高度动画容器，内部行保持原始尺寸，只由容器边界整体裁切
   * @default undefined
   */
  getAnimationAnchorKey?: (item: T, index: number) => string | number | undefined
  /**
   * 是否让指定行在可视范围外仍保持挂载
   *
   * 适用于分组头等结构行：数据折叠导致其跨越较长距离时，Motion 仍能取得
   * 变更前后的布局坐标；普通内容行不应常驻，以免失去虚拟化收益
   * @default () => false
   */
  shouldKeepMounted?: (item: T, index: number) => boolean
  /**
   * 常驻行跨越视口边界时，是否把 Motion 位移轨迹限制到可见区域
   * @default true
   */
  clampPersistentLayoutToViewport?: boolean
  /**
   * 新增数据项的初始状态；滚动导致的普通虚拟行挂载不会播放
   * @default { opacity: 0 }
   */
  initial?: false | TargetAndTransition
  /**
   * 数据项的常驻状态
   * @default { opacity: 1 }
   */
  animate?: TargetAndTransition
  /**
   * 删除数据项的退出状态；滚动导致的普通虚拟行卸载不会播放
   * @default { opacity: 0 }
   */
  exit?: TargetAndTransition
  /** Motion 布局、进入和退出动画的过渡配置 */
  transition?: Transition
}

/**
 * 分组虚拟列表的单个分组定义
 */
export interface VirtualGroupSection<T> {
  /** 分组唯一标识 */
  key: string
  /** 组头内容，函数形式可获取展开态；不传则该组无组头、恒为展开 */
  header?: ReactNode | ((expanded: boolean) => ReactNode)
  /** 组内数据 */
  items: T[]
  /**
   * 是否可折叠（点击组头切换）
   * @default true
   */
  collapsible?: boolean
  /** 收起态预览内容（如 StackedCards 堆叠卡），不传则收起后只剩组头 */
  collapsedPreview?: ReactNode
  /**
   * 组内是否还有更多数据
   * @default false
   */
  hasMore?: boolean
  /** 组内加载更多，组内最后一个已加载行进入可视区时触发 */
  loadMore?: () => Promise<any>
  /**
   * 组数据加载中，展开时在组尾展示 loading 行
   * @default false
   */
  loading?: boolean
}

/**
 * 组内单项的渲染上下文
 */
export interface VirtualGroupItemCtx<T> {
  section: VirtualGroupSection<T>
  /** 在组内的索引 */
  indexInSection: number
  /** 是否组内第一项 */
  isFirst: boolean
  /** 是否组内最后一项（首末行圆角拼接等场景） */
  isLast: boolean
}

/**
 * 扁平化后的异构虚拟行
 */
export type VirtualGroupRow<T> =
  | { type: 'header'; key: string; section: VirtualGroupSection<T>; expanded: boolean }
  | { type: 'item'; key: string; section: VirtualGroupSection<T>; item: T; ctx: VirtualGroupItemCtx<T> }
  | { type: 'preview'; key: string; section: VirtualGroupSection<T> }
  | { type: 'loader'; key: string; section: VirtualGroupSection<T> }

/**
 * 分组虚拟列表属性
 *
 * 组件自身即滚动容器（继承 TanstackVirtualList），必须通过 className/style 给定高度上限
 * 所有分组共用一个滚动条与一个虚拟化实例，组头/卡片/收起预览/loading 都是虚拟行
 */
export type VirtualGroupListProps<T> = {
  /** 分组数据 */
  sections: VirtualGroupSection<T>[]

  /**
   * 渲染组内单项
   *
   * 注意：项与项之间的间距必须用 padding 实现，
   * margin 不参与高度测量，会导致滚动漂移
   */
  renderItem: (item: T, ctx: VirtualGroupItemCtx<T>) => ReactNode

  /**
   * 项 key 提取（组内唯一即可，内部会拼上分组 key）
   * @default item => item.id ?? indexInSection
   */
  getItemKey?: (item: T, indexInSection: number) => string | number

  /** 受控展开的分组 key 列表（传入即受控） */
  expanded?: string[]

  /** 非受控模式的初始展开分组；不传则默认全部展开 */
  defaultExpanded?: string[]

  /**
   * 展开分组变化回调
   * 回调参数包含所有处于展开态的分组 key（含不可折叠的分组）
   */
  onExpandedChange?: (expandedKeys: string[]) => void

  /**
   * 收起态预览是否可点击展开
   * @default true
   */
  collapsedPreviewClickable?: boolean

  /**
   * 每项预估高度（px）
   * @default 64
   */
  estimateSize?: number

  /**
   * 可视区上下额外预渲染的行数
   * @default 5
   */
  overscan?: number

  /**
   * 可选的分组虚拟行布局动画；组头和 loading 参与位置动画，layoutId 仅应用于 item 行
   * @default undefined
   */
  layoutAnimation?: VirtualGroupLayoutAnimationOptions<T>

  /**
   * 同 TanstackVirtualListProps.useCachedMeasurements
   * @default false
   */
  useCachedMeasurements?: boolean

  /**
   * 分组加载中是否展示组尾 loading 行
   * @default true
   */
  showLoading?: boolean

  /** item 行容器类名 */
  itemClassName?: string | ((item: T, ctx: VirtualGroupItemCtx<T>) => string | undefined)

  /** 组头行容器类名 */
  headerClassName?: string

  /** 收起预览行容器类名 */
  previewClassName?: string

  /** 自定义组尾 loading 行内容（如骨架屏），不传则为居中 LoadingIcon */
  renderLoader?: (section: VirtualGroupSection<T>) => ReactNode

  /** 所有分组拍平后无任何行时渲染的空态内容 */
  empty?: ReactNode

  /** 虚拟内容容器类名，用于约束内容宽度而保持滚动条贴外层边缘 */
  contentClassName?: string

  /** 滚动容器元素 ref（滚动位置保存/恢复等场景） */
  scrollRef?: Ref<HTMLDivElement>
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

/** 分组虚拟列表的布局动画配置 */
export type VirtualGroupLayoutAnimationOptions<T> =
  & Omit<
    VirtualListLayoutAnimationOptions<VirtualGroupRow<T>>,
    'getLayoutId' | 'shouldKeepMounted' | 'getAnimationAnchorKey'
  >
  & {
    /** 为业务 item 提供跨分组共享布局标识 */
    getItemLayoutId?: (item: T, ctx: VirtualGroupItemCtx<T>) => string | undefined
    /**
     * 是否让分组头在可视范围外保持挂载，以支持长分组折叠/展开动画
     * @default true
     */
    keepHeadersMounted?: boolean
    /**
     * 分组行进入或退出时是否以所属组头作为动画锚点
     * @default true
     */
    anchorItemsToHeader?: boolean
  }
