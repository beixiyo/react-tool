import type { ShortCutTarget } from 'hooks'
import type { Dispatch, SetStateAction } from 'react'
import type { KeyEnum, ModifierExpectation } from 'utils/keyboard'

export type SearchBarProps =
  & {
    actions?: Action[]
    value?: string
    onSelect?: (action: Action | null) => void
    onSubmit?: () => void
    onChange?: ((val: string) => void) | (Dispatch<SetStateAction<string>>)
    selectedAction?: Action | null
    /**
     * 无匹配结果时的空态文案；不传时跟随 I18nProvider 语言，无 Provider 时为英文
     * @default 'No matching results'
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
    shortcut?: SearchBarShortcut | readonly SearchBarShortcut[] | false | null
    /**
     * 快捷键监听目标；传入元素时只有焦点位于该元素内才响应，传 `null` 不监听
     * @default window
     */
    shortcutTarget?: ShortCutTarget | null
  }
  & Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'>

export interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  short?: string
  end?: string
}

/**
 * SearchBar 聚焦快捷键
 *
 * `key` 为 `KeyboardEvent.key`（大小写不敏感）；修饰键省略表示不限制，`mod` 在 Mac 上为 Cmd、其它平台为 Ctrl
 */
export type SearchBarShortcut = ModifierExpectation & {
  key: KeyEnum
}
