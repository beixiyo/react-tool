/**
 * TextFadeIn 类型声明
 */

import type * as React from 'react'

export type TextFadeInProps = {
  /**
   * 要显示的文本内容
   * @required
   */
  text: string
  /**
   * 每个字符出现耗时（ms/字符）
   * @default 24
   */
  duration?: number
  /**
   * 控制渐变区域的宽度
   * @default '6em'
   */
  fadeWidth?: string
  /**
   * 文字实色（渐变末端为透明）。用于自定义文字颜色
   * @default 'rgb(var(--text))'
   */
  color?: string
  /** 根 span 自定义类名 */
  className?: string
  /** 根 span 自定义样式（会与内置渐变样式合并，同名键覆盖内置） */
  style?: React.CSSProperties
}

/**
 * @deprecated 请使用 {@link TextFadeInProps}，此别名仅为向后兼容保留
 */
export type FadeInTextProps = TextFadeInProps
