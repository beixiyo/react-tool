import type { CODE_HIGHLIGHT_THEME_LIST } from './constants'

/** 行间距选项 */
export type LineSpacing = 'normal' | 'compact' | 'tight' | 'custom'

export type ShikiTheme = typeof CODE_HIGHLIGHT_THEME_LIST[number]

export type CodeHighlightProps = {
  /**
   * 需要高亮显示的代码字符串
   */
  code: string
  /**
   * 代码语言
   * @default 'javascript'
   */
  language?: string
  /**
   * 是否显示行号
   * @default true
   */
  showLineNumbers?: boolean
  /**
   * Shiki主题名称
   * @default 'vitesse-dark'
   */
  theme?: ShikiTheme
  /**
   * 代码区域最大高度
   */
  maxHeight?: string | number
  /**
   * 是否显示复制按钮
   * @default true
   */
  copyable?: boolean
  /**
   * 行高设置
   * @default 0.5
   */
  lineHeight?: number | string
  /**
   * 节流更新时间
   * @default 0
   */
  throttleUpdateTime?: number
}
& React.HTMLAttributes<HTMLDivElement>
