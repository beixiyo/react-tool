import { vi } from 'vitest'

const ROW_HEIGHT = 40

/** 模拟滚动终值及随 scrollTop 变化的几何；不模拟浏览器平滑动画 */
export function setScrollGeometry(listbox: HTMLElement, scroller = listbox, height = 80, scale = 1) {
  const options = Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'))
  scroller.style.overflowY = 'auto'
  Object.defineProperties(scroller, {
    clientHeight: { configurable: true, value: height },
    offsetHeight: { configurable: true, value: height },
    scrollHeight: { configurable: true, value: options.length * ROW_HEIGHT },
    scrollTo: {
      configurable: true,
      value: vi.fn((position: ScrollToOptions) => {
        if (position.top != null) scroller.scrollTop = position.top
        if (position.left != null) scroller.scrollLeft = position.left
      }),
    },
  })

  vi.spyOn(scroller, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 100, 200, height * scale))
  options.forEach((option, index) => {
    vi.spyOn(option, 'getBoundingClientRect').mockImplementation(() =>
      new DOMRect(
        0,
        100 + (index * ROW_HEIGHT - scroller.scrollTop) * scale,
        200,
        ROW_HEIGHT * scale,
      )
    )
  })
}
