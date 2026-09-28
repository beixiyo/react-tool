/**
 * 向 iframe 注入 CSS 并写入完整的 HTML 内容
 * @param iframeEl 目标 iframe 元素
 * @param externalHtml 外部提供的完整 HTML 字符串
 * @param styleTxt 需要注入的 CSS 字符串
 */
export function setIframe(
  iframeEl: HTMLIFrameElement,
  externalHtml: string,
  styleTxt: string,
): void {
  const parser = new DOMParser()
  const doc = parser.parseFromString(externalHtml, 'text/html')

  /** 注入样式 */
  const styleElement = document.createElement('style')
  styleElement.textContent = styleTxt
  doc.head.appendChild(styleElement)

  /** 获取处理后的 HTML 字符串 */
  const processedHtml = doc.documentElement.outerHTML

  /** 使用 Blob URL 写入 iframe */
  const blob = new Blob([processedHtml], { type: 'text/html' })
  const blobUrl = URL.createObjectURL(blob)
  iframeEl.src = blobUrl

  iframeEl.onload = () => {
    URL.revokeObjectURL(blobUrl)
  }
}
