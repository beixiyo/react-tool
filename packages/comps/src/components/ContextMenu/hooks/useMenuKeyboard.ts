import { useLatestCallback, useTypeahead } from 'hooks'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { focusElement, getBoundaryEnabledIndex, getNextEnabledIndex } from 'utils/keyboard'

/**
 * 菜单项键盘导航（roving focus）：焦点直接落在菜单项上，菜单项自身 `tabIndex=-1`
 *
 * - ArrowDown / ArrowUp 循环移动，Home / End 跳到首 / 末项，均跳过 disabled
 * - 可打印字符做 typeahead，连续输入在超时内视为同一前缀
 * - Enter / Space 激活非原生按钮的菜单项（原生 button / a 交给浏览器，避免重复 click）
 * - Tab 关闭菜单（菜单不是 Tab 序列的一部分，焦点由焦点范围归还给打开前的元素）
 *
 * 菜单项由 children 任意渲染，因此每次按键时从 DOM 现查，只认属于当前菜单（非嵌套子菜单）的项
 */
export function useMenuKeyboard(options: UseMenuKeyboardOptions) {
  const { menuRef, onClose } = options

  /** 菜单项只能在按键时从 DOM 读取，列表来源按次传给 handleKey */
  const typeahead = useTypeahead({})

  const onKeyDown = useLatestCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    const menu = menuRef.current
    if (!menu || event.defaultPrevented || event.nativeEvent.isComposing) return

    if (event.key === 'Tab') {
      event.preventDefault()
      onClose()
      return
    }

    const items = getMenuItems(menu)
    const isDisabled = (index: number) => isMenuItemDisabled(items[index]!)
    const source = {
      count: items.length,
      getLabel: (index: number) => items[index]!.textContent,
      isDisabled,
    }
    const activeItem = (event.target as Element).closest?.(MENU_ITEM_SELECTOR)
    const current = activeItem
      ? items.indexOf(activeItem as HTMLElement)
      : -1

    const focusIndex = (index: number) => {
      event.preventDefault()
      if (index !== -1) focusElement(items[index])
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        const direction = event.key === 'ArrowDown'
          ? 1
          : -1
        focusIndex(getNextEnabledIndex({ count: items.length, current, direction, loop: true, isDisabled }))
        return
      }
      case 'Home':
      case 'End':
        focusIndex(getBoundaryEnabledIndex(
          items.length,
          event.key === 'Home'
            ? 1
            : -1,
          isDisabled,
        ))
        return
      case 'Enter':
      case ' ': {
        /**
         * 按 APG：正在 typeahead 时空格属于查询的一部分（如「Save as」），只进缓冲，
         * 无匹配也不激活，并阻止原生按钮在 keyup 时派发 click
         */
        if (event.key === ' ' && typeahead.isTyping()) {
          focusIndex(typeahead.handleKey(event, current, source))
          return
        }

        if (current === -1 || isDisabled(current)) return
        if (isNativeActivatable(items[current]!)) return

        event.preventDefault()
        items[current]!.click()
        return
      }
    }

    const index = typeahead.handleKey(event, current, source)
    if (index !== -1) focusIndex(index)
  })

  return onKeyDown
}

const MENU_ITEM_SELECTOR = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'

/** 当前菜单的直属菜单项，排除嵌套子菜单与隐藏项 */
function getMenuItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR))
    .filter((item) => item.closest('[role="menu"]') === menu && !item.closest('[hidden], [inert]'))
}

function isMenuItemDisabled(item: HTMLElement) {
  return item.matches(':disabled') || item.getAttribute('aria-disabled') === 'true'
}

/** 原生 button / 链接会在 Enter / Space 时自行派发 click */
function isNativeActivatable(item: HTMLElement) {
  return item instanceof HTMLButtonElement || (item instanceof HTMLAnchorElement && item.hasAttribute('href'))
}

type UseMenuKeyboardOptions = {
  /** 菜单根节点（`role="menu"`） */
  menuRef: RefObject<HTMLElement | null>
  /** 请求关闭菜单 */
  onClose: () => void
}
