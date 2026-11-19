import { useKeyboardLayer, useLatestRef, useShortCutKey } from 'hooks'
import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import type { KeyEnum } from 'utils/keyboard'
import { isEditableTarget } from 'utils/keyboard'
import { Z } from '../../../constants/z-index'

/** 方向键与翻页方向的映射：左 / 上为上一张，右 / 下为下一张 */
const ARROW_DIRECTION: Partial<Record<string, -1 | 1>> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
}

const LAYER_KEYS: readonly KeyEnum[] = ['Escape', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']

/**
 * 预览层键盘交互
 *
 * - Esc 关闭、方向键翻页走同一个键盘层：上层浮层（如操作菜单、Modal）打开时由层栈决定归属
 * - 焦点在可编辑元素内时方向键留给输入控件（Esc 仍关闭预览，保持原行为）
 * - 预览自带的操作菜单打开时，菜单层只消费 Esc；方向键仍翻页（翻页后旧菜单随之关闭）
 * - Ctrl/Cmd+C 复制当前图片
 */
export function usePreviewKeyboard({ zIndex, style, contextMenuOpen, requestClose, handlePrevImage, handleNextImage, handleCopy }: {
  zIndex: number | undefined
  style: CSSProperties | undefined
  contextMenuOpen: boolean
  requestClose: (via: 'escape') => void
  handlePrevImage: () => void
  handleNextImage: () => void
  handleCopy: () => Promise<void>
}) {
  const paginate = (key: string) => {
    const direction = ARROW_DIRECTION[key]
    if (direction === -1) handlePrevImage()
    else if (direction === 1) handleNextImage()
  }
  const paginateRef = useLatestRef(paginate)

  useKeyboardLayer({
    active: true,
    keys: LAYER_KEYS,
    priority: typeof zIndex === 'number'
      ? zIndex
      : typeof style?.zIndex === 'number'
      ? style.zIndex
      : Z.preview,
    when: (event) => event.key === 'Escape' || !isEditableTarget(event.target),
    onKeyDown: (event) => {
      if (event.key === 'Escape') {
        /** 长按 Esc 不重复关闭 */
        if (!event.repeat) requestClose('escape')
        return
      }

      paginate(event.key)
    },
  })

  /**
   * 操作菜单打开时它位于层栈顶，但菜单本身不处理方向键：
   * 仅在此期间临时监听方向键翻页，菜单关闭即解绑，仍跳过可编辑目标
   */
  useEffect(() => {
    if (!contextMenuOpen || typeof window === 'undefined') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!ARROW_DIRECTION[event.key] || isEditableTarget(event.target)) return

      event.preventDefault()
      event.stopPropagation()
      paginateRef.current(event.key)
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [contextMenuOpen, paginateRef])

  /**
   * Ctrl/Cmd+C 复制当前图片
   *
   * `mod` 按平台区分主修饰键（Mac 用 Cmd，其它平台用 Ctrl）；
   * 排除 Shift / Alt 组合，不抢 Ctrl+Shift+C（开发者工具）等系统快捷键；
   * 焦点在可编辑元素上时不拦截，保留系统复制选区行为
   */
  useShortCutKey({
    key: 'c',
    mod: true,
    shift: false,
    alt: false,
    capture: true,
    allowRepeat: false,
    ignoreWhenEditable: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleCopy()
    },
  })
}
