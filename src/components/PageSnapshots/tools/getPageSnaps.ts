import { NOTIFY_PARENT_MESSAGE_TYPE } from '@/hooks'
import { getWinHeight, getWinWidth, wait } from '@jl-org/tool'
import { snapdom } from '@zumer/snapdom'
import localforage from 'localforage'

const store = localforage.createInstance({ name: 'pageSnap' })

/**
 * 创建一个可复用的隐藏 iframe
 */
function createReusableIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.style.border = 'none'
  iframe.loading = 'eager'
  Object.assign(iframe.style, {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(iframe)
  return iframe
}

/**
 * 将 iframe 重置为可复用状态
 */
function resetIframe(iframe: HTMLIFrameElement) {
  try {
    iframe.src = 'about:blank'
  }
  catch {
    /** 忽略潜在跨域错误 */
  }
}

/**
 * 流式获取页面截图，需要在被截图组件，通知 iframe 加载完毕
 * @see {@link useNotifyParentReady}
 *
 * @param componentInfos 要截图的组件信息数组
 * @param opts 配置选项
 * @returns Promise，解析为 ComponentSnap 数组
 */
export async function getPageSnaps(
  componentInfos: ComponentInfo[],
  opts: GetPageSnapsStreamOpts = {},
): Promise<ComponentSnap[]> {
  if (!componentInfos || componentInfos.length === 0) {
    return []
  }

  const {
    maxConcurrentTasks = 2,
    singleTimeout = 1000 * 10,
    onProgress,
    onSuccess,
    onError,
    signal,
  } = opts
  signal?.throwIfAborted()

  const results: ComponentSnap[] = []
  const errors: Array<{ info: ComponentInfo, error: any }> = []
  let completed = 0

  /** 创建 iframe 池 */
  const iframePool = Array.from({ length: maxConcurrentTasks }, () => createReusableIframe())

  /** 任务队列 */
  const queue = [...componentInfos]

  /** 循环处理队列直至为空或被中断 */
  async function worker(iframe: HTMLIFrameElement) {
    while (queue.length > 0 && !signal?.aborted) {
      const info = queue.shift()
      if (!info)
        break

      try {
        const result = await processSingleInfoWithIframe(iframe, info, singleTimeout, signal)
        results.push(result)
        completed++
        onSuccess?.(result)
        onProgress?.(completed, componentInfos.length, result, null)
      }
      catch (error) {
        completed++
        const errorInfo = { info, error }
        errors.push(errorInfo)
        onError?.(info, error)
        onProgress?.(completed, componentInfos.length, null, errorInfo)
      }
    }
  }

  /** 启动所有工作 */
  await Promise.all(iframePool.map(worker))

  /** 全部完成后销毁 iframe */
  iframePool.forEach((iframe) => {
    try {
      iframe.remove()
    }
    catch {
      /** 忽略潜在错误 */
    }
  })

  return results.filter(Boolean) as ComponentSnap[]
}

function cleanupScreenshotTask(task: ScreenshotTaskContext, removeIframe = true) {
  try {
    /** 移除事件监听器 */
    if (task.messageListener) {
      window.removeEventListener('message', task.messageListener)
    }

    /** 清除定时器 */
    if (task.timeoutId) {
      clearTimeout(task.timeoutId)
      task.timeoutId = undefined
    }

    /** 根据标志决定是否移除 iframe */
    if (removeIframe && task.iframe && task.iframe.parentNode) {
      /** 先清空iframe内容，释放内存 */
      if (task.iframe.contentWindow) {
        try {
          task.iframe.contentWindow.location.href = 'about:blank'
        }
        catch {
          /** 忽略跨域错误 */
        }
      }
      task.iframe.remove()
    }

    task.messageListener = null as any
    task.iframe = null as any
  }
  catch (error) {
    console.warn('清理截图任务时出错:', error)
  }
}

async function captureScreenshotFromIframe(
  iframe: HTMLIFrameElement,
  componentInfo: ComponentInfo,
): Promise<{ imgUrl: string, width: number, height: number }> {
  const contentDoc = iframe.contentWindow?.document
  if (!contentDoc?.body) {
    throw new Error(`Iframe for ${componentInfo.path} content body not found.`)
  }

  /** 短暂延迟确保所有样式应用和微小DOM更新完成 */
  await wait(40)

  const dom = (await snapdom.toWebp(contentDoc.body))
  const snap = {
    imgUrl: dom.src,
    width: dom.width,
    height: dom.height,
  }

  /** 保存完整的 ComponentSnap 对象到缓存 */
  const fullSnap: ComponentSnap = {
    componentInfo,
    imgUrl: snap.imgUrl,
    width: snap.width,
    height: snap.height,
  }
  store.setItem(componentInfo.path, fullSnap)

  return snap
}

/**
 * 使用指定 iframe 完成单个组件截图（复用 iframe）
 */
async function processSingleInfoWithIframe(
  iframe: HTMLIFrameElement,
  componentInfo: ComponentInfo,
  singleTimeout?: number,
  signal?: AbortSignal,
): Promise<ComponentSnap> {
  const { resolve, reject, promise } = Promise.withResolvers<ComponentSnap>()

  /** 检查缓存 */
  try {
    const snap = await store.getItem<ComponentSnap>(componentInfo.path)
    if (snap?.componentInfo) {
      resolve(snap)
      return promise
    }
  }
  catch (error) {
    console.warn(`读取缓存失败 ${componentInfo.path}:`, error)
  }

  iframe.width = `${componentInfo.width || getWinWidth()}px`
  iframe.height = `${componentInfo.height || getWinHeight()}px`

  const taskContext: ScreenshotTaskContext = {
    componentInfo,
    iframe,
    signal,
    resolve: (snap) => {
      cleanupScreenshotTask(taskContext, false)
      resetIframe(iframe)
      resolve(snap)
    },
    reject: (reason) => {
      cleanupScreenshotTask(taskContext, false)
      resetIframe(iframe)
      reject(reason)
    },
    messageListener: () => {},
  }

  taskContext.messageListener = (event: MessageEvent) => {
    if (
      event.source === iframe.contentWindow
      && event.data
      && event.data.type === NOTIFY_PARENT_MESSAGE_TYPE
      && event.data.path === componentInfo.path
    ) {
      if (taskContext.timeoutId)
        clearTimeout(taskContext.timeoutId)

      const { componentWidth, componentHeight } = event.data

      iframe.width = componentWidth
        ? `${componentWidth}px`
        : iframe.width
      iframe.height = componentHeight
        ? `${componentHeight}px`
        : iframe.height

      setTimeout(() => {
        if (signal?.aborted) {
          taskContext.reject(new DOMException('Aborted', 'Skip Snapshot'))
          return
        }
        captureScreenshotFromIframe(iframe, componentInfo)
          .then((screenshotData) => {
            taskContext.resolve({
              componentInfo,
              imgUrl: screenshotData.imgUrl,
              width: screenshotData.width,
              height: screenshotData.height,
            })
          })
          .catch(taskContext.reject)
      }, componentInfo.delay || 0)
    }
  }

  window.addEventListener('message', taskContext.messageListener)

  /** 中断监听 */
  signal?.addEventListener('abort', () => {
    taskContext.reject(new DOMException('Aborted', 'Skip Snapshot'))
  }, { once: true })

  taskContext.timeoutId = window.setTimeout(() => {
    taskContext.reject(new Error(`Screenshot timeout for ${componentInfo.path} after ${singleTimeout}ms`))
  }, singleTimeout)

  iframe.src = componentInfo.path
  return promise
}

export type GetPageSnapsOpts = {
  /**
   * 单个截图超时时间
   * @default 1000 * 100
   */
  singleTimeout?: number
  /**
   * 并发截图数量
   * @default 2
   */
  maxConcurrentTasks?: number
}

export type GetPageSnapsStreamOpts = GetPageSnapsOpts & {
  /**
   * 中断信号
   */
  signal?: AbortSignal
  /**
   * 进度回调函数
   * @param completed 已完成数量
   * @param total 总数量
   * @param success 成功的截图结果（如果有）
   * @param error 错误信息（如果有）
   */
  onProgress?: (
    completed: number,
    total: number,
    success: ComponentSnap | null,
    error: { info: ComponentInfo, error: any } | null
  ) => void
  /**
   * 单个截图成功回调
   */
  onSuccess?: (result: ComponentSnap) => void
  /**
   * 单个截图失败回调
   */
  onError?: (info: ComponentInfo, error: any) => void
}

export type ComponentInfo = {
  path: string
  name: string
  /** iframe 初始宽度 */
  width?: number
  /** iframe 初始高度 */
  height?: number
  /** 延迟加载时间，单位ms，默认0 */
  delay?: number
}

export type ComponentSnap = {
  componentInfo: ComponentInfo
  imgUrl: string
  /** 截图图片的实际宽度 (来自 canvas) */
  width: number
  /** 截图图片的实际高度 (来自 canvas) */
  height: number
}

/** 内部任务管理 */
interface ScreenshotTaskContext {
  componentInfo: ComponentInfo
  resolve: (value: ComponentSnap) => void
  reject: (reason?: any) => void
  iframe: HTMLIFrameElement
  messageListener: (event: MessageEvent) => void
  timeoutId?: number
  signal?: AbortSignal
}
