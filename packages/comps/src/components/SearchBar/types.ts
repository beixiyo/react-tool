/**
 * SearchBar 类型声明
 */

import type { Dispatch, SetStateAction } from 'react'
export type SearchBarProps =
  & {
    actions?: Action[]
    value?: string
    onSelect?: (action: Action | null) => void
    onSubmit?: () => void
    onChange?: ((val: string) => void) | (Dispatch<SetStateAction<string>>)
    selectedAction?: Action | null
    /**
     * 无匹配结果时的空态文案
     * @default '没有找到匹配的结果'
     */
    emptyText?: React.ReactNode
    /**
     * 自定义候选列表底部内容；不传则使用默认快捷键提示
     */
    footer?: React.ReactNode
    /**
     * 是否展示候选列表底部区域
     * @default true
     */
    showFooter?: boolean
  }
  & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  short?: string
  end?: string
}
