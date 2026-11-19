import { useFocusScope, useKeyboardLayer, useLatestCallback } from 'hooks'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { getTabbableElements, shouldIgnoreParentEnter } from 'utils/keyboard'
import { DATA_ATTR } from '../../../constants/dataAttributes'

/**
 * 管理 Modal 的焦点进入、容器内 Tab 循环和关闭后焦点恢复
 *
 * Escape 使用 useKeyboardLayer 按视觉层级互斥；Tab 由弹窗自身接收，
 * 避免 Modal 打开时拦截组件外部产生的键盘事件
 *
 * 返回的 `onKeyDown` 要挂在**焦点范围**（`focusScopeRef`，即遮罩）上，挂 dialog 不够：
 * 遮罩上的 fixed 关闭按钮是 dialog 的兄弟节点也在 Tab 环里，焦点落到它身上时
 * dialog 收不到事件，下一次 Tab 就走浏览器默认导航跑出弹窗。Enter 另有
 * `container.contains(target)` 把关，不会因此扩大确认范围
 */
export function useModalFocus(
  options: UseModalFocusOptions,
) {
  const {
    open,
    containerRef,
    focusScopeRef,
    priority,
    isTop,
    onClose,
    onOk,
    escToClose,
    enterToConfirm,
    confirmDisabled,
  } = options
  /**
   * 进入 / Tab 循环 / 归还交给通用焦点范围；Tab 范围是遮罩（`focusScopeRef`），
   * 初始焦点仍优先宿主用 `DATA_ATTR.modal.autofocus` 指定的元素：按 DOM 顺序取首个可 Tab 元素时，
   * 自绘头部里的关闭按钮往往排在输入框前面，焦点落在它身上再按 Enter 就把弹窗关了
   */
  const focusScope = useFocusScope({
    active: open,
    containerRef,
    trapRef: focusScopeRef,
    trap: true,
    initialFocus: resolveModalInitialFocus,
  })

  const handleContainerKeyDown = useLatestCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab') {
      focusScope.onKeyDown(event)
      return
    }

    if (
      event.key !== 'Enter'
      || !isTop
      || !shouldConfirmOnEnter(event.nativeEvent, containerRef.current, {
        enabled: enterToConfirm,
        disabled: confirmDisabled,
        hasHandler: !!onOk,
      })
    ) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onOk?.()
  })

  useKeyboardLayer({
    active: open,
    keys: ['Escape'],
    priority,
    allowRepeat: false,
    handlerEnabled: escToClose,
    onKeyDown: () => onClose?.(),
  })

  return handleContainerKeyDown
}

function resolveModalInitialFocus(container: HTMLElement) {
  return container.querySelector<HTMLElement>(`[${DATA_ATTR.modal.autofocus}]`)
    ?? getTabbableElements(container)[0]
    ?? container
}

function shouldConfirmOnEnter(
  event: KeyboardEvent,
  container: HTMLElement | null,
  options: EnterConfirmOptions,
) {
  if (!options.enabled || options.disabled || !options.hasHandler || !container) return false
  if (event.defaultPrevented || event.repeat || event.isComposing) return false
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false

  const target = event.target
  if (!(target instanceof Element) || !container.contains(target)) return false

  const owningDialog = target.closest('[role="dialog"]')
  if (owningDialog !== container) return false

  return !shouldIgnoreParentEnter(target)
}

type UseModalFocusOptions = {
  open: boolean
  containerRef: RefObject<HTMLElement | null>
  focusScopeRef: RefObject<HTMLElement | null>
  priority: number
  isTop: boolean
  onClose?: () => void
  onOk?: () => void | false | Promise<void | false>
  escToClose: boolean
  enterToConfirm: boolean
  confirmDisabled: boolean
}

type EnterConfirmOptions = {
  enabled: boolean
  disabled: boolean
  hasHandler: boolean
}
