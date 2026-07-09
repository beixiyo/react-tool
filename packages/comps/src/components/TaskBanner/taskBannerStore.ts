import type { TaskBannerConfig, TaskBannerFailOptions, TaskBannerItemData, TaskBannerStartOptions } from './types'

/**
 * TaskBanner 全局堆叠状态仓库
 *
 * 与 messageStore 同范式（发布订阅 + useSyncExternalStore），关键差异：
 * - 新任务**头插**（视觉上最新在上），而非 Message 的追加队尾
 * - 条目带状态机：pending →（移除 | failed），failed 持久存在直到重试 / 关闭
 * - 额外持有一份全局配置（文案 / 收拢阈值 / 容器位置），变更同样走订阅通知
 */

let items: TaskBannerItemData[] = []
let seed = 0
const listeners = new Set<Listener>()

const defaultConfig: TaskBannerConfig = {
  maxVisibleFailures: 3,
  topOffset: 64,
  placement: 'top',
}

let config: TaskBannerConfig = { ...defaultConfig }

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export const taskBannerStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /** 返回稳定引用，仅在内容变化时生成新数组 */
  getSnapshot(): TaskBannerItemData[] {
    return items
  },

  /** 返回稳定引用，仅在 setConfig 时生成新对象 */
  getConfig(): TaskBannerConfig {
    return config
  },

  /** 增量合并全局配置（收拢阈值 / 容器位置），并通知容器重渲染 */
  setConfig(patch: Partial<TaskBannerConfig>) {
    config = { ...config, ...patch }
    emit()
  },

  /** 新增一条处理中彩条，头插到栈顶（最新在上），返回其唯一 id */
  add(options: TaskBannerStartOptions) {
    const id = ++seed
    const nextItem: TaskBannerItemData = {
      id,
      status: 'pending',
      motionProps: options.motionProps,
      content: options.content,
      showClose: options.showClose,
      closeBtnProps: options.closeBtnProps,
      onClose: options.onClose,
    }

    const layoutId = options.motionProps?.layoutId
    const restItems = layoutId
      ? items.map(item => item.motionProps?.layoutId === layoutId
          ? { ...item, motionProps: { ...item.motionProps, layoutId: undefined } }
          : item)
      : items

    items = [nextItem, ...restItems]
    emit()
    return id
  },

  /** 把指定彩条转为持久失败态；已失败 / 已移除则 no-op */
  fail(id: number, options?: TaskBannerFailOptions) {
    const target = items.find(item => item.id === id)
    if (!target || target.status === 'failed') {
      return
    }

    /** reason 原样存储（可为空），缺省文案由渲染层按当前语言用 i18n 兜底 */
    items = items.map(item => item.id === id
      ? {
          ...item,
          status: 'failed' as const,
          reason: options?.reason,
          onRetry: options?.onRetry,
          showClose: hasOwn(options, 'showClose')
            ? options?.showClose
            : item.showClose,
          closeBtnProps: hasOwn(options, 'closeBtnProps')
            ? options?.closeBtnProps
            : item.closeBtnProps,
          onClose: hasOwn(options, 'onClose')
            ? options?.onClose
            : item.onClose,
        }
      : item)
    emit()
  },

  /** 移除指定彩条（成功结算、静默关闭、重试出栈均走此路径） */
  remove(id: number) {
    if (!items.some(item => item.id === id)) {
      return
    }
    items = items.filter(item => item.id !== id)
    emit()
  },
}

function hasOwn<T extends object, K extends PropertyKey>(
  value: T | undefined,
  key: K,
): value is T & Record<K, unknown> {
  return !!value && Object.prototype.hasOwnProperty.call(value, key)
}

type Listener = () => void
