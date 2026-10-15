/**
 * 收紧横排纯文本的换行宽度，保留 CSS 限宽和文本对齐方式
 * 不依赖具体组件；负责目标元素行内 width 的设置与清理
 */
import { useLayoutEffect, useRef } from 'react'

/**
 * 测量实际换行片段，按最长一行收紧文本容器
 *
 * 独占目标元素的行内 width；目标应仅含纯文本，padding / border 放在外层
 * 内容、视口尺寸或字体加载变化时重测，不监听父容器的独立尺寸变化
 * 禁用、文本为 undefined 或卸载时，移除行内 width 并清理监听
 *
 * @returns 绑定到纯文本元素的 contentRef
 */
export function useFitTextWidth<E extends HTMLElement = HTMLDivElement>({
  text,
  enabled = true,
}: UseFitTextWidthOptions) {
  const contentRef = useRef<E>(null)

  useLayoutEffect(() => {
    const element = contentRef.current

    if (!element || !enabled || text === undefined) {
      return
    }

    const view = element.ownerDocument.defaultView
    if (!view) return

    let disposed = false

    const fitWidth = () => {
      if (disposed || !element.isConnected) return

      // 先恢复 CSS 自适应布局，避免沿用上一次收紧宽度而无法在窗口变大时展开
      element.style.removeProperty('width')

      const layoutWidth = Number.parseFloat(view.getComputedStyle(element).width)
      const renderedWidth = element.getBoundingClientRect().width
      if (!layoutWidth || !renderedWidth) return

      const range = element.ownerDocument.createRange()
      range.selectNodeContents(element)

      // 双向文本在同一行可能有多个片段，取整行边界，不能把片段当成独立行
      const lines = new Map<number, { left: number, right: number }>()

      for (const rect of range.getClientRects()) {
        const line = lines.get(rect.top)

        lines.set(rect.top, {
          left: Math.min(line?.left ?? rect.left, rect.left),
          right: Math.max(line?.right ?? rect.right, rect.right),
        })
      }

      if (lines.size < 2) return

      const longestLine = Math.max(...Array.from(lines.values(), line => line.right - line.left))
      // Range 使用屏幕坐标；进入动画的 scale 不能被写回为 CSS 布局宽度
      const width = Math.min(layoutWidth, Math.ceil(longestLine * layoutWidth / renderedWidth))

      element.style.width = `${width}px`
    }

    fitWidth()

    const fonts = element.ownerDocument.fonts
    view.addEventListener('resize', fitWidth)
    fonts?.addEventListener('loadingdone', fitWidth)
    void fonts?.ready.then(fitWidth)

    return () => {
      disposed = true
      view.removeEventListener('resize', fitWidth)
      fonts?.removeEventListener('loadingdone', fitWidth)
      element.style.removeProperty('width')
    }
  }, [text, enabled])

  return { contentRef }
}

/** 自动收紧纯文本容器宽度的配置 */
export interface UseFitTextWidthOptions {
  /** 与目标元素保持一致的纯文本；用于触发重测，undefined 表示不接管布局 */
  text: string | number | undefined
  /**
   * 是否启用纯文本收宽
   * @default true
   */
  enabled?: boolean
}
