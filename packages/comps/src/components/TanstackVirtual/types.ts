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
   * 可见行位移与出入场动画；只动画已挂载的可见行和 overscan 行
   * @default undefined
   */
  layoutAnimation?: VirtualListLayoutAnimationOptions<T>

  /**
   * 让一组行的尺寸由同一个进度逐帧驱动，而不是由 DOM 测量决定
   *
   * 折叠/展开这类「一整段高度整体变化」的场景，如果直接增删行，
   * virtualizer 的 totalSize 与后续行 start 会在同一帧跳到终态，动画只能作为
   * 贴纸叠在上面：中途进入可视区的行没有 FLIP 起点，必然直接落在终点位置，
   * 与仍在收缩的内容重叠
   *
   * 这里让这些行留在行模型里、保持挂载，用 `resizeItem` 逐帧改写每一行的尺寸
   * （手风琴式：靠前的行满高、边缘行被裁、之后的行为 0），让 virtualizer 的几何
   * 本身成为动画的唯一真相源；后续行、滚动锚定、可视范围推进因此全部自洽，
   * 起播时也不需要挂载或卸载任何东西
   * @default undefined
   */
  sizeTransition?: VirtualSizeTransitionOptions<T>

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
 * 虚拟列表固定使用 `layout="position"`，避免动态高度卡片在换序时被缩放；
 * 尺寸驱动动画（sizeTransition）进行期间几何已经逐帧连续，位移动画会自动停用
 */
export type VirtualListLayoutAnimationOptions<T> = {
  /**
   * 行 key 未变化、仅内容尺寸变化时是否继续播放外层布局动画
   * 内部已经负责高度动画的动态行应关闭，避免两层动画先后追赶同一高度
   * @default true
   */
  animateSizeChanges?: boolean
  /** 跨 key 或跨分组移动时使用的 Motion layoutId */
  getLayoutId?: (item: T, index: number) => string | undefined
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

/** 尺寸驱动的方向 */
export type VirtualSizeTransitionDirection = 'collapse' | 'expand'

/**
 * 尺寸驱动行的规格
 *
 * 同一 `group` 的行必须在数据里连续出现，它们共用一个进度：
 * collapse 时整组从满高缩到 0，expand 时从 0 长到满高；满高取每行的
 * 实测高度（展开时量挂载节点的内容高度，未挂载的行按 estimateSize）
 */
export type VirtualSizeTransitionSpec = {
  /** 所属驱动组，同组行共用一个进度值 */
  group: string | number
  /** collapse 从满高动到 0，expand 从 0 动到满高 */
  direction: VirtualSizeTransitionDirection
}

/**
 * 尺寸驱动动画配置
 *
 * 组件只负责「逐帧把尺寸写进 virtualizer」这一通用机制，
 * 哪些行进入驱动、何时切回普通行都由调用方决定
 */
export type VirtualSizeTransitionOptions<T> = {
  /** 返回该行的驱动规格；返回 undefined 表示该行按普通行测量 */
  getSpec: (item: T, index: number) => VirtualSizeTransitionSpec | undefined
  /**
   * 某个驱动组播完的回调（含 prefers-reduced-motion 下的立即结束）
   * 调用方据此把该组的行切回普通行（收起的组通常是移出行模型）
   */
  onSettled: (group: string | number) => void
  /**
   * 驱动过渡。默认使用 duration-first spring，时长与距离解耦，
   * 分组长短不改变收放手感
   * @default { type: 'spring', visualDuration: 0.32, bounce: 0, restDelta: 0.5, restSpeed: 10 }
   */
  transition?: Transition
  /**
   * 动画距离上限（px），超出部分瞬时完成
   *
   * 收放由用户点击组头触发时，组头必在视口内，组体超出一个视口的部分本来就
   * 看不见；夹取同时给了动画速度一个上界，长分组不会既慢又要驱动大量行
   * @default 滚动容器的 clientHeight
   */
  maxDistance?: number
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
 * 收放动画期间行所属的驱动组
 *
 * - `items:<section>`：整组 item 行，收起时从满高缩到 0、展开时从 0 长到满高
 * - `preview:<section>`：展开时的收起态预览行，从预览高度缩到 0；收起时预览行
 *   直接作为普通行出现在组体下方，动画结束时几何已经是终态
 */
export type VirtualGroupRowTransition = {
  group: string
  direction: VirtualSizeTransitionDirection
}

/**
 * 扁平化后的异构虚拟行
 */
export type VirtualGroupRow<T> =
  | { type: 'header'; key: string; section: VirtualGroupSection<T>; expanded: boolean }
  | {
    type: 'item'
    key: string
    section: VirtualGroupSection<T>
    item: T
    ctx: VirtualGroupItemCtx<T>
    /** 收放动画期间该行所属的驱动组 */
    transition?: VirtualGroupRowTransition
  }
  | { type: 'preview'; key: string; section: VirtualGroupSection<T>; transition?: VirtualGroupRowTransition }
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
   * 可选的分组虚拟行布局动画；layoutId 仅应用于 item 行
   * @default undefined
   */
  layoutAnimation?: VirtualGroupLayoutAnimationOptions<T>

  /**
   * 分组收放动画；不传则收放为瞬时切换
   *
   * 开启后，任何原因导致的展开态翻转（点击组头 / 预览、受控 expanded 改变）
   * 都会播放：收放期间整组 item 行留在行模型里、保持挂载，尺寸由同一个进度
   * 逐帧驱动，virtualizer 的几何逐帧跟随动画，组后面的行不会先跳到终态再补动画
   * @default undefined
   */
  collapseAnimation?: VirtualGroupCollapseAnimationOptions

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
  & Omit<VirtualListLayoutAnimationOptions<VirtualGroupRow<T>>, 'getLayoutId'>
  & {
    /** 为业务 item 提供跨分组共享布局标识 */
    getItemLayoutId?: (item: T, ctx: VirtualGroupItemCtx<T>) => string | undefined
  }

/**
 * 分组收放动画配置
 */
export type VirtualGroupCollapseAnimationOptions = {
  /**
   * 收放过渡。默认 duration-first spring，时长与折叠距离解耦：
   * 3 项和 300 项的分组收放手感一致
   * @default { type: 'spring', visualDuration: 0.32, bounce: 0, restDelta: 0.5, restSpeed: 10 }
   */
  transition?: Transition
  /**
   * 动画距离上限（px），超出部分瞬时完成
   * @default 滚动容器的 clientHeight
   */
  maxDistance?: number
}
