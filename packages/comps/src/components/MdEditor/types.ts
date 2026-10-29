/**
 * MdEditor 类型声明
 */

import type { ReactNode } from 'react'
export interface MdEditorRef {
  toggleEditMode: () => void
  toggleFullscreen: () => void
  isEditMode: boolean
  isFullscreen: boolean
}

export type LayoutMode = 'auto' | 'horizontal' | 'vertical'

export interface HeaderControls {
  isEditMode: boolean
  toggleEditMode: () => void
  isFullscreen: boolean
  toggleFullscreen: () => void
  title?: string
  showFullscreen?: boolean
}

export interface MdEditorProps {
  /**
   * 初始内容
   * @default ''
   */
  content?: string
  /**
   * 内容变化回调
   */
  onChange?: (value: string) => void
  /**
   * 布局模式
   * @default 'auto'
   */
  layout?: LayoutMode
  /**
   * 初始是否为编辑模式
   * @default false
   */
  defaultEditMode?: boolean
  /**
   * 容器类名
   */
  className?: string
  /**
   * 编辑器类名
   */
  mdClassName?: string
  /**
   * 头部高度
   * @default 56
   */
  headerHeight?: number
  /**
   * 编辑器占位符
   * @default '开始编写你的 Markdown...'
   */
  placeholder?: string
  /**
   * 是否显示全屏按钮
   * @default true
   */
  showFullscreen?: boolean
  /**
   * 标题
   * @default 'Markdown Editor'
   */
  title?: string
  /**
   * 允许自定义头部
   */
  renderHeader?: ((controls: HeaderControls) => ReactNode) | null
}

export type MdToHtmlProps =
  & {
    className?: string
    style?: React.CSSProperties
    content: string
    /**
     * 是否需要解析 Markdown 为 HTML？
     * 在部分情况下，外部直接传入 HTML 更高效
     * @default true
     */
    needParse?: boolean
    throttleTime?: number
    skipXSS?: boolean
    /** 解析前的 Markdown 转换回调；名称沿用历史 API，并非 HTML 后处理 */
    postProcess?: (markdown: string) => Promise<string> | string
    /**
     * 是否启用中日韩强调与删除线边界兼容；保留旧参数名，不再改写正文或插入空格
     * @default true
     */
    preprocessMarkdownFormat?: boolean
    /**
     * 是否应用内置 GitHub Markdown 样式
     * @default true
     */
    withMarkdownBodyStyles?: boolean
  }
  & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type MdToHtmlRef = HTMLDivElement
