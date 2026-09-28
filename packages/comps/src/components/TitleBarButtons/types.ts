/**
 * TitleBarButtons 类型声明
 */

import type { X } from 'lucide-react'
import type { Size } from '../../types'

export type ButtonId = 'close' | 'minimize' | 'maximize'

export type ButtonMeta = {
  color: string
  hoverColor: string
  iconColor: string
  icon: typeof X
}

export type TitleBarButtonsProps = {
  /**
   * 圆点尺寸
   * @default 'md'
   */
  size?: Size
  /**
   * 按钮排列顺序
   * @default ['close', 'minimize', 'maximize']
   */
  order?: ButtonId[]
  /** 自定义圆点类名 */
  dotClassName?: string
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  /**
   * 按钮级元数据覆盖（颜色 / hover 颜色 / 图标颜色 / 图标），按 id 部分覆盖默认值
   * @default undefined
   */
  buttonMeta?: Partial<Record<ButtonId, Partial<ButtonMeta>>>
  /**
   * 各按钮的无障碍标签（aria-label），便于 i18n
   * @default { close: 'Close', minimize: 'Minimize', maximize: 'Maximize' }
   */
  labels?: Partial<Record<ButtonId, string>>
} & React.HTMLAttributes<HTMLElement>
