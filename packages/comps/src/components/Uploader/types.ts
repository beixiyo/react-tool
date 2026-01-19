import type { Refs } from 'hooks'
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

export interface FileItem {
  file: File
  base64: string
}

export interface UploaderRef {
  clear: () => void
  click: () => void
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
   * 自定义预览组件
   */
  renderItem?: (props: {
    src: string
    index: number
    onRemove: () => void
  }) => ReactNode
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

  children?: ReactNode
}
& Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>
