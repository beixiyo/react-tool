import type { ReactNode } from 'react'

export interface CascaderOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  children?: CascaderOption[]
}

export interface CascaderRef {
  open: () => void
  close: () => void
}

export interface CascaderProps {
  /** 级联选项数据 */
  options: CascaderOption[]
  /** 当前选中的值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 值变更回调 */
  onChange?: (value: string) => void
  /** 点击外部关闭回调 */
  onClickOutside?: () => void
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义触发器元素，如果不提供则不渲染触发器 */
  trigger?: ReactNode
  /** 触发器点击回调 */
  onTriggerClick?: () => void
  /** 下拉面板的定位方式 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  /** 下拉面板的偏移量 */
  offset?: number
  /** 下拉面板高度 */
  dropdownHeight?: number
  /** 下拉面板最小宽度 */
  dropdownMinWidth?: number
  /** 自定义类名 */
  className?: string
  /** 下拉面板类名 */
  dropdownClassName?: string
  /** 下拉面板选项类名 */
  optionClassName?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
}
