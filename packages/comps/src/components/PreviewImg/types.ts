import type { ContextMenuItemProps, ContextMenuProps } from '../ContextMenu/types'
import type { ImgThumbnailsOrientation, ImgThumbnailsProps } from '../ImgThumbnails/types'

/** 缩略图列表贴靠的边 */
export type PreviewImgThumbnailPlacement = 'top' | 'bottom' | 'left' | 'right'

export type PreviewImgProps = {
  /**
   * 预览图片的URL，支持单张或多张图片
   * - string: 单张图片预览
   * - string[]: 多张图片预览，顶部显示轮播图切换
   */
  src: string | string[]
  /**
   * 关闭预览的回调函数
   */
  onClose: () => void
  /**
   * 用户请求关闭的安全观察，先于onClose调用；异常不阻止关闭
   * 自定义工具栏ctx.close直接调用原onClose，不触发本观察
   * @default undefined
   */
  onCloseRequested?: (request: { via: 'close_button' | 'escape' | 'backdrop' }) => void
  /**
   * 初始显示的图片索引（仅多图时有效）
   * @default 0
   */
  initialIndex?: number
  /**
   * 已提交的有效显示索引变化观察；初挂、同值、单图与无效索引恢复不通知，异常隔离
   * @default undefined
   */
  onIndexChanged?: (change: { index: number; count: number }) => void
  /**
   * 复制完成后的回调（成功与失败都会通知）；传入后组件不再自行弹出复制反馈消息，
   * 由调用方决定提示方式；回调异常隔离，不影响复制流程
   * @default undefined
   */
  onCopy?: (result: PreviewImgCopyResult) => void
  /** 自定义复制实现；接收触发时的图片地址。@default undefined */
  copyImage?: (src: string) => void | Promise<void>
  /** 自定义下载实现；接收触发时的图片地址，适合接入原生保存面板。@default undefined */
  downloadImage?: (src: string) => void | Promise<void>
  /** 下载操作结束或失败的通知；浏览器下载触发不代表文件已保存。@default undefined */
  onDownload?: (result: PreviewImgCopyResult) => void
  /** 覆盖内置工具栏及右键菜单图标。@default undefined */
  actionIcons?: Partial<Record<'copy' | 'download', React.ReactNode>>
  /**
   * 缩略图布局方向
   * @default 'horizontal'
   */
  orientation?: ImgThumbnailsOrientation
  /**
   * 缩略图列表贴靠的边，不传时由 `orientation` 推导（horizontal → top，vertical → right）
   */
  thumbnailPlacement?: PreviewImgThumbnailPlacement
  /**
   * 透传给内部 `ImgThumbnails` 的配置，用于定制尺寸、圆角、选中态等
   */
  thumbnailProps?: Omit<ImgThumbnailsProps, 'images' | 'currentIndex' | 'onImageChange' | 'orientation'>
  /**
   * 整条替换缩略图列表，定位与让位仍由预览负责
   */
  renderThumbnails?: (ctx: PreviewImgOverlayCtx) => React.ReactNode
  /**
   * 右键菜单配置。默认提供复制和下载当前图片；函数返回节点时完全替换菜单内容，
   * 对象配置可追加自定义菜单项，或通过 mode: 'replace' 覆盖默认复制项；传 null 禁用右键菜单，保留原生右键行为
   * @default undefined
   */
  contextMenu?: PreviewImgContextMenu | null
  /**
   * 透传给内部 ContextMenu 的配置；菜单内容、open 与 onOpenChange 由 PreviewImg 管理
   * @default undefined
   */
  contextMenuProps?: Omit<ContextMenuProps, 'children' | 'open' | 'onOpenChange'>
  /**
   * 透传给右键菜单各项的配置，如间距、类名、图标与禁用状态；单项配置可覆盖 icon / disabled
   * @default undefined
   */
  contextMenuItemProps?: Omit<ContextMenuItemProps, 'children' | 'onClick'>
  /**
   * 底部工具栏的统一控制入口（{@inheritdoc PreviewImgToolbar}）
   * @default 所有内置按钮
   */
  toolbar?: PreviewImgToolbar
  /**
   * 是否显示缩略图
   * @default true
   */
  showThumbnails?: boolean
  /**
   * 是否在大图左右两侧显示「上一张 / 下一张」箭头（仅多图时生效）
   * @default true
   */
  showNavArrows?: boolean
  /**
   * 点击遮罩空白区域时是否关闭预览
   * @default true
   */
  maskClosable?: boolean
  /**
   * 预览层对 Electron 窗口拖拽区的命中策略
   * - `no-drag`：预览打开期间优先保证按钮和图片交互命中
   * - `inherit`：不额外声明 app-region，沿用外层窗口行为
   * @default 'no-drag'
   */
  windowDragMode?: 'no-drag' | 'inherit'
  /**
   * 预览大图基准显示的最大宽度（px），实际生效值为它与视口可用宽度的较小者，
   * 用户仍可通过滚轮缩放放大；不传则只受视口可用宽度约束
   */
  imageMaxWidth?: number
  /**
   * 预览层 z-index
   * @default Z.preview
   */
  zIndex?: number
  /**
   * 外部加载态：调用方仍在准备当前图片的新地址（如下载、缓存解析）时置 true，
   * 在旧图上方显示加载遮罩。同一下标原地换源后、新图加载完成前遮罩会自动显示，无需传入
   * @default false
   */
  loading?: boolean
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'onCopy' | 'contextMenu'>

/** 右键菜单自定义项 */
export interface PreviewImgContextMenuItem {
  /** 菜单项显示内容 */
  label: React.ReactNode
  /** 菜单项点击回调 */
  onSelect: (ctx: PreviewImgOverlayCtx) => void
  /** 菜单项左侧图标 */
  icon?: React.ReactNode
  /** 是否禁用 */
  disabled?: boolean
}

/** 右键菜单自定义方式：函数完全替换内容；配置项支持追加或替换默认项 */
export type PreviewImgContextMenu = ((ctx: PreviewImgOverlayCtx) => React.ReactNode) | {
  /** 自定义菜单项 */
  items: PreviewImgContextMenuItem[]
  /** 追加到默认复制项，或完全替换默认项 */
  mode?: 'append' | 'replace'
}

/** PreviewImg 暴露给外部的命令式操作 */
export interface PreviewImgRef {
  /** 复制当前图片到系统剪贴板 */
  copyImage: () => Promise<void>
  /** 下载当前图片，使用与工具栏相同的处理逻辑 */
  downloadImage: () => Promise<void>
}

/** 内置工具栏操作 */
export type ControlButtonName = 'rotate' | 'reset' | 'copy' | 'download'

/** 自定义工具栏按钮；组件负责按钮布局和交互样式 */
export interface PreviewToolbarAction {
  /** 稳定且不与其他按钮重复的标识 */
  key: string
  /** 按钮图标 */
  icon: React.ReactNode
  /** 按钮无障碍名称 */
  label: string
  /** 可选的按钮可见文字 */
  text?: React.ReactNode
  /** 是否禁用 */
  disabled?: boolean
  /** 覆盖工具栏 Tooltip 开关；不传时继承工具栏设置 */
  tooltip?: boolean
  /** 点击时接收当前预览状态 */
  onClick: (ctx: PreviewImgOverlayCtx) => void
}

/** 内置工具栏项的单独配置 */
export interface PreviewToolbarBuiltinItem {
  /** 内置按钮名称 */
  name: ControlButtonName
  /** 覆盖工具栏 Tooltip 开关；不传时继承工具栏设置 */
  tooltip?: boolean
}

/** 内置或自定义工具栏项 */
export type PreviewToolbarItem = ControlButtonName | PreviewToolbarBuiltinItem | PreviewToolbarAction

/** 工具栏配置；不传时显示所有内置项，空 items 隐藏工具栏 */
export type PreviewImgToolbar =
  | {
    /** 按数组顺序显示；不传时显示所有内置项，函数可根据当前图片返回不同项目 */
    items?: readonly PreviewToolbarItem[] | ((ctx: PreviewImgOverlayCtx) => readonly PreviewToolbarItem[])
    /** 局部覆盖内置项图标 */
    icons?: Partial<Record<ControlButtonName, React.ReactNode>>
    /** 工具栏按钮是否显示 Tooltip；单个按钮可覆盖
     * @default true
     */
    tooltip?: boolean
    /** 工具栏容器样式 */
    className?: string
    render?: never
  }
  | {
    /** 完全替换工具栏；调用方负责内容布局 */
    render: (ctx: PreviewImgOverlayCtx) => React.ReactNode
    items?: never
    icons?: never
    tooltip?: never
    className?: never
  }

/** 传给自定义工具栏 / 缩略图列表的上下文，让外部 TSX 能与预览联动 */
export interface PreviewImgOverlayCtx {
  /** 全部图片 */
  images: string[]
  /** 当前图片下标 */
  currentIndex: number
  /** 当前图片地址 */
  currentSrc: string
  /** 当前缩放倍率 */
  scale: number
  /** 当前旋转角度 */
  rotation: number
  /** 切到指定下标 */
  select: (index: number) => void
  /** 上一张 */
  prev: () => void
  /** 下一张 */
  next: () => void
  /** 顺时针旋转 90° */
  rotate: () => void
  /** 复位缩放、旋转与位移 */
  reset: () => void
  /** 复制当前图片 */
  copy: () => Promise<void>
  /** 下载当前图片 */
  download: () => Promise<void>
  /** 关闭预览 */
  close: () => void
}

/** 复制结果：成功时无 `error`，失败时携带原始错误 */
export interface PreviewImgCopyResult {
  /** 本次复制的图片地址 */
  src: string
  /** 是否复制成功 */
  success: boolean
  /** 失败原因（成功时无此字段） */
  error?: Error
}
