import type { RefObject } from 'react'
import { useLatestCallback } from 'hooks'
import { useLayoutEffect } from 'react'

/**
 * 文本域自动高度逻辑
 *
 * - 根据内容换行自动变高（`autoResize` 为 true 时生效）
 * - 高度封顶在 `maxRows` 行，超出后切换为内部滚动
 * - 受控值外部变化（模板插入、清空、语音转写等）或挂载时自动同步高度
 *
 * 返回的 `adjustHeight` 引用稳定，可在输入事件中直接调用
 */
export function useAutoResize(
  {
    textareaRef,
    autoResize = false,
    minRows = 1,
    maxRows,
    value,
  }: UseAutoResizeOptions,
) {
  const adjustHeight = useLatestCallback(() => {
    const el = textareaRef.current
    if (!el || !autoResize)
      return

    const cs = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(cs.lineHeight) || Number.parseFloat(cs.fontSize) * 1.5
    const paddingY = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom)
    const borderY = Number.parseFloat(cs.borderTopWidth) + Number.parseFloat(cs.borderBottomWidth)

    /** 先重置高度，确保 scrollHeight 反映真实内容高度 */
    el.style.height = 'auto'

    /** border-box 下 scrollHeight 不含 border，需补回 */
    const contentHeight = el.scrollHeight + borderY
    const minHeight = minRows * lineHeight + paddingY + borderY

    let target = Math.max(contentHeight, minHeight)
    let overflow = false

    if (maxRows != null) {
      const maxHeight = maxRows * lineHeight + paddingY + borderY
      if (target > maxHeight) {
        target = maxHeight
        overflow = true
      }
    }

    el.style.height = `${target}px`
    el.style.overflowY = overflow
      ? 'auto'
      : 'hidden'
  })

  /** 同步外部值变化与挂载初始高度（useLayoutEffect 在绘制前执行，避免高度跳动） */
  useLayoutEffect(() => {
    if (autoResize)
      adjustHeight()
  }, [value, autoResize, minRows, maxRows])

  return adjustHeight
}

type UseAutoResizeOptions = {
  /** 文本域元素 ref */
  textareaRef: RefObject<HTMLTextAreaElement | null>
  /** 是否启用自动高度 */
  autoResize?: boolean
  /** 最小行数 */
  minRows?: number
  /** 最大行数，超出后内部滚动 */
  maxRows?: number
  /** 当前文本值，用于在受控更新时重新计算高度 */
  value?: string
}
