import { useKeyboardLayer, useShortCutKey } from 'hooks'
import type { CSSProperties } from 'react'
import { Z } from '../../../constants/z-index'

export function usePreviewKeyboard({ zIndex, style, requestClose, handlePrevImage, handleNextImage, handleCopy }: {
  zIndex: number | undefined
  style: CSSProperties | undefined
  requestClose: (via: 'escape') => void
  handlePrevImage: () => void
  handleNextImage: () => void
  handleCopy: () => Promise<void>
}) {
  useKeyboardLayer({
    active: true,
    keys: ['Escape'],
    priority: typeof zIndex === 'number'
      ? zIndex
      : typeof style?.zIndex === 'number'
      ? style.zIndex
      : Z.preview,
    allowRepeat: false,
    onKeyDown: () => requestClose('escape'),
  })

  /** 左箭头键切换到上一张（同 ESC：捕获阶段消费并阻断冒泡，避免方向键漏到底层组件） */
  useShortCutKey({
    key: 'ArrowLeft',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handlePrevImage()
    },
  })

  /** 右箭头键切换到下一张 */
  useShortCutKey({
    key: 'ArrowRight',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleNextImage()
    },
  })

  /** 上箭头键切换到上一张 */
  useShortCutKey({
    key: 'ArrowUp',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handlePrevImage()
    },
  })

  /** 下箭头键切换到下一张 */
  useShortCutKey({
    key: 'ArrowDown',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleNextImage()
    },
  })

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
