import type { Refs } from 'hooks'
import type {
  ClipboardEvent,
  CSSProperties,
  DragEvent,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

/** renderPreviewList 的配置，用于自定义预览列表样式 */
export interface RenderPreviewListOptions {
  /** 预览列表容器 className，会与 Uploader 的 previewClassName 合并 */
  className?: string
  /** 可选覆盖本次渲染的预览配置（如尺寸、自定义 renderItem） */
  previewConfig?: Partial<PreviewConfig>
}

/** 自定义上传区域时传入的上下文 */
export interface UploadAreaRenderContext {
  /** 是否有文件拖入 */
  dragActive: boolean
  /** 拖入是否无效（类型/大小等不合法） */
  dragInvalid: boolean
  disabled: boolean
  /** 触发文件选择（等同于点击 input） */
  triggerClick: () => void
  /** 绑定到根元素以支持拖拽、粘贴、点击触发，如 <div {...getRootProps()}> */
  getRootProps: () => {
    'onDragEnter'?: (e: DragEvent) => void
    'onDragLeave'?: (e: DragEvent) => void
    'onDragOver'?: (e: DragEvent) => void
    'onDrop'?: (e: DragEvent) => void
    'onPaste'?: (e: ClipboardEvent) => void
    'onClick': () => void
    'role': 'button'
    'aria-disabled': boolean
    'className': string
  }
  /**
   * 渲染默认预览列表，可在自定义布局中任意位置使用
   * @param options 可选，用于自定义本次渲染的样式（与 Uploader 的 previewClassName / previewConfig 合并）
   */
  renderPreviewList: (options?: RenderPreviewListOptions) => ReactNode
}

export interface FileItem {
  file: File
  base64: string
}

export interface UploaderRef {
  clear: () => void
  click: () => void
}

/** 自定义「添加」按钮时传入的上下文 */
export interface AddTriggerRenderProps {
  /** 点击触发文件选择 */
  onClick: () => void
  disabled: boolean
  width: number
  height: number
  dragActive: boolean
  dragInvalid: boolean
}

export type PreviewConfig = {
  /**
   * 预览图片宽度
   * @default 70
   */
  width?: number
  /**
   * 预览图片高度
   * @default 70
   */
  height?: number

  /**
   * 自定义预览项组件
   */
  renderItem?: (props: {
    src: string
    index: number
    onRemove: () => void
  }) => ReactNode

  /**
   * 自定义「添加」按钮 JSX，传入上下文后可完全自定义样式与结构
   */
  renderAddTrigger?: (props: AddTriggerRenderProps) => ReactNode
}

export type UploaderProps = {
  /**
   * 上传模式
   * @default 'default'
   */
  mode?: 'default' | 'card'
  /**
   * 是否禁用上传功能
   * @default false
   */
  disabled?: boolean
  /**
   * 单轮选择去重
   */
  distinct?: boolean
  /**
   * 最大上传图片数量
   */
  maxCount?: number
  /**
   * 最大文件大小，单位字节
   */
  maxSize?: number
  /**
   * 最大图片像素，文件必须是图片，并且可加载
   */
  maxPixels?: {
    width: number
    height: number
  }

  onChange?: (files: FileItem[]) => void
  onRemove?: (index: number) => void
  onExceedSize?: (size: number) => void
  onExceedCount?: VoidFunction
  onExceedPixels?: (width: number, height: number) => void

  /**
   * 谁可以触发粘贴事件
   */
  pasteEls?: Refs<HTMLElement>
  previewImgs?: string[]
  placeholder?: string
  showAcceptedTypesText?: boolean

  /**
   * 预览配置
   */
  previewConfig?: PreviewConfig

  /**
   * 选择图片后自动清理，适用于单图上传
   * 不设置的话，无法上传相同图片
   * @default false
   */
  autoClear?: boolean

  /**
   * 外部拖拽区域的ref
   * 如果提供，将在该元素上添加拖拽事件监听
   */
  dragAreaEl?: React.RefObject<HTMLElement | null>

  /**
   * 是否在使用外部拖拽区域的同时渲染children
   * @default false
   */
  renderChildrenWithDragArea?: boolean
  /**
   * 是否使用点击外部拖拽区域触发文件选择
   * @default false
   */
  dragAreaClickTrigger?: boolean

  /** 样式相关 */
  className?: string
  style?: CSSProperties
  previewClassName?: string
  dragActiveClassName?: string

  /**
   * 自定义上传区域 JSX，传入上下文后可完全自定义拖拽区与预览布局
   * 使用 getRootProps() 绑定事件以保留拖拽/粘贴/点击触发
   * 使用 renderPreviewList() 在任意位置插入默认预览列表
   */
  renderUploadArea?: (ctx: UploadAreaRenderContext) => ReactNode

  children?: ReactNode
}
& Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>
