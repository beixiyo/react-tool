/**
 * 焦点位置判定：区分「焦点在可编辑区域」与「焦点在普通元素」
 */

/**
 * 焦点是否位于输入框、文本域或 contenteditable 区域内
 *
 * 全局快捷键用它避开与文字输入冲突；键盘层可在 `when` 里复用同一份判定
 * @param selector 自定义可编辑区域选择器
 * @default EDITABLE_SELECTOR
 */
export function isFocusInEditable(selector: string = EDITABLE_SELECTOR): boolean {
  if (typeof document === 'undefined')
    return false

  const el = document.activeElement
  return !!el && el instanceof HTMLElement && !!el.closest(selector)
}

/** 默认视为可编辑区域的选择器 */
export const EDITABLE_SELECTOR = 'input, textarea, [contenteditable="true"]'
