'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'

/**
 * ContextMenu 的菜单项，行高、内边距、圆角与 Select 选项保持同一套布局
 */
export const ContextMenuItem = memo(({
  icon,
  extra,
  disabled = false,
  className,
  contentClassName,
  labelClassName,
  children,
  onClick,
  ...rest
}: ContextMenuItemProps) => {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={ disabled }
      aria-disabled={ disabled || undefined }
      { ...{ [DATA_ATTR.disabled]: disabled } }
      className={ cn(
        'flex w-full min-h-9 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[10px] px-2 text-left text-text',
        'outline-none transition-all duration-400 ease-out',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-background3 focus-visible:bg-background3',
        className,
      ) }
      onClick={ disabled
        ? undefined
        : onClick }
      { ...rest }
    >
      <span className={ cn('flex flex-1 items-center gap-2 min-w-0', contentClassName) }>
        { icon && <span className="flex shrink-0 items-center">{ icon }</span> }
        <span className={ cn('truncate text-sm', labelClassName) }>{ children }</span>
      </span>

      { extra && <span className="flex shrink-0 items-center gap-1">{ extra }</span> }
    </button>
  )
})

ContextMenuItem.displayName = 'ContextMenuItem'

export type ContextMenuItemProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'role'> & {
  /** 左侧图标 */
  icon?: React.ReactNode
  /** 右侧附加内容，如快捷键提示、勾选图标 */
  extra?: React.ReactNode
  /**
   * 禁用后不触发 onClick
   * @default false
   */
  disabled?: boolean
  /** 菜单项文字 */
  children?: React.ReactNode
  /** 图标 + 文字容器的额外类名 */
  contentClassName?: string
  /** 文字的额外类名 */
  labelClassName?: string
}
