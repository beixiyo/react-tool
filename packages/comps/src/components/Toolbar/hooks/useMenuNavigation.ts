import { useLatestRef } from 'hooks'
import { useEffect, useState } from 'react'
import { getBoundaryEnabledIndex, getNextEnabledIndex, isComposingEvent } from 'utils/keyboard'

/**
 * 菜单导航方向
 * - "horizontal": 水平导航（使用左右方向键）
 * - "vertical": 垂直导航（使用上下方向键）
 * - "both": 双向导航（同时支持水平和垂直）
 */
type Orientation = 'horizontal' | 'vertical' | 'both'

interface MenuNavigationOptions<T> {
  /**
   * 触发源对象，可以是 Tiptap 编辑器或任何具有 view.dom 的对象
   */
  editor?: { view: { dom: HTMLElement } } | null
  /**
   * 用于处理键盘事件的容器元素引用
   */
  containerRef?: React.RefObject<HTMLElement | null>
  /**
   * 影响所选项目的搜索查询
   */
  query?: string
  /**
   * 要导航的项目数组
   */
  items: T[]
  /**
   * 选择项目时触发的回调函数
   */
  onSelect?: (item: T) => void
  /**
   * 菜单应关闭时触发的回调函数
   */
  onClose?: () => void
  /**
   * 菜单的导航方向
   * @default "vertical"
   */
  orientation?: Orientation
  /**
   * 是否在菜单打开时自动选择第一项
   * @default true
   */
  autoSelectFirstItem?: boolean
  /**
   * 判断项目是否禁用；方向键、Home / End 跳过禁用项，Enter 不选中禁用项
   */
  isItemDisabled?: (item: T, index: number) => boolean
  /**
   * 方向键到头时是否绕回另一端
   * @default true
   */
  loop?: boolean
}

/**
 * 为下拉菜单、命令面板和自动完成组件实现键盘导航的自定义 Hook
 *
 * 提供方向键导航、Home/End 键跳转、Enter 键选择和 Escape 键关闭，均跳过禁用项；
 * Tab 不拦截，焦点可正常离开。监听只绑定在编辑器 DOM 或 `containerRef` 上，不监听 window / document
 *
 * @template T - 菜单项的类型
 * @param options - 菜单导航的配置选项
 */
export function useMenuNavigation<T>({
  editor,
  containerRef,
  query,
  items,
  onSelect,
  onClose,
  orientation = 'vertical',
  autoSelectFirstItem = true,
  isItemDisabled,
  loop = true,
}: MenuNavigationOptions<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    autoSelectFirstItem
      ? 0
      : -1,
  )

  const latestRef = useLatestRef({ items, selectedIndex, onSelect, onClose, isItemDisabled, loop })

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      const { items, selectedIndex, onSelect, onClose, isItemDisabled, loop } = latestRef.current
      const count = items.length
      if (!count) return false

      const isDisabled = (index: number) => !!isItemDisabled?.(items[index]!, index)
      const move = (direction: 1 | -1) =>
        setSelectedIndex((current) => {
          const next = getNextEnabledIndex({ count, current, direction, loop, isDisabled })
          return next === -1
            ? current
            : next
        })
      const moveToBoundary = (direction: 1 | -1) => {
        const next = getBoundaryEnabledIndex(count, direction, isDisabled)
        if (next !== -1) setSelectedIndex(next)
      }

      switch (event.key) {
        case 'ArrowUp': {
          if (orientation === 'horizontal') return false
          event.preventDefault()
          move(-1)
          return true
        }

        case 'ArrowDown': {
          if (orientation === 'horizontal') return false
          event.preventDefault()
          move(1)
          return true
        }

        case 'ArrowLeft': {
          if (orientation === 'vertical') return false
          event.preventDefault()
          move(-1)
          return true
        }

        case 'ArrowRight': {
          if (orientation === 'vertical') return false
          event.preventDefault()
          move(1)
          return true
        }

        case 'Home': {
          event.preventDefault()
          moveToBoundary(1)
          return true
        }

        case 'End': {
          event.preventDefault()
          moveToBoundary(-1)
          return true
        }

        case 'Enter': {
          if (isComposingEvent(event)) return false
          event.preventDefault()
          if (selectedIndex !== -1 && items[selectedIndex] !== undefined && !isDisabled(selectedIndex)) {
            onSelect?.(items[selectedIndex])
          }
          return true
        }

        case 'Escape': {
          event.preventDefault()
          onClose?.()
          return true
        }

        /** Tab 不拦截，焦点按浏览器默认顺序离开 */
        default:
          return false
      }
    }

    const targetElement = editor?.view?.dom ?? containerRef?.current ?? null
    if (!targetElement) return undefined

    targetElement.addEventListener('keydown', handleKeyboardNavigation, true)
    return () => targetElement.removeEventListener('keydown', handleKeyboardNavigation, true)
  }, [editor, containerRef, orientation, latestRef])

  useEffect(() => {
    if (query) {
      setSelectedIndex(
        autoSelectFirstItem
          ? 0
          : -1,
      )
    }
  }, [query, autoSelectFirstItem])

  return {
    selectedIndex: items.length
      ? selectedIndex
      : undefined,
    setSelectedIndex,
  }
}
