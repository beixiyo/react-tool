/**
 * TextOverflow 类型声明
 */

import type { BaseType } from '@jl-org/tool'
import type * as React from 'react'

export interface TextOverflowProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode

  /**
   * 是否显示全部文本
   */
  showAllText?: boolean

  /**
   * 显示的行数
   * @default 1
   */
  line?: number
  /**
   * 单行行高
   * @default 1rem
   */
  lineHeight?: BaseType
  /**
   * 渐变边界宽度
   * @default 10rem
   */
  GradientBoundaryWidth?: BaseType
  /**
   * 渐变起始颜色
   * @default 'rgb(var(--background) / 1)'
   */
  fromColor?: string
  /**
   * 溢出样式模式
   * - 'ellipsis': 使用省略号（...）
   * - 'gradient': 使用渐变过渡
   * @default 'gradient'
   */
  mode?: 'ellipsis' | 'gradient'
}
