/**
 * ThemeToggle 类型声明
 */

import type { Theme } from '@jl-org/tool'
import type * as React from 'react'

export type ThemeToggleProps = {
  /**
   * 当前的主题，用于决定显示太阳还是月亮
   */
  theme?: Theme
  /**
   * 切换器的宽度，高度会根据比例自动计算
   * @default 80
   */
  size?: number
  /**
   * 点击事件的回调，通常用于触发主题切换逻辑
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  /**
   * 自定义容器的 className
   */
  className?: string
  /**
   * 受控模式回调：传入后组件进入「受控」分支
   *
   * 此时点击只会播放过渡动画并回调 `onChange(next)`，由父组件自行管理主题来源，
   * 组件内部不再调用 `useTheme` 写全局主题，避免与父组件的主题来源双写冲突
   * 不传则保持原有行为：点击直接切换组件库内置的全局主题
   */
  onChange?: (next: Theme) => void
}
