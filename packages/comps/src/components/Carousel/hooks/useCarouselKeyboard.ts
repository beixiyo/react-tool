import { useShortCutKey } from 'hooks'

/**
 * 轮播图键盘导航 Hook
 *
 * @param enableKeyboardNav 是否启用键盘导航
 * @param paginate 翻页回调
 * @param scope 监听范围；默认绑定轮播容器，显式 global 时绑定 window
 * @param containerElement 轮播容器
 */
export function useCarouselKeyboard(
  enableKeyboardNav: boolean,
  paginate: (direction: number) => void,
  scope: 'global' | 'container',
  containerElement: HTMLElement | null,
) {
  const target = scope === 'global'
    ? typeof window === 'undefined'
      ? null
      : window
    : containerElement

  useShortCutKey({
    key: 'ArrowLeft',
    el: target,
    enabled: enableKeyboardNav,
    ignoreWhenEditable: true,
    onKeyDown: () => paginate(-1),
  })

  useShortCutKey({
    key: 'ArrowRight',
    el: target,
    enabled: enableKeyboardNav,
    ignoreWhenEditable: true,
    onKeyDown: () => paginate(1),
  })
}
