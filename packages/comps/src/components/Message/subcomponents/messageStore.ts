import type { MessageItemData, MessageUpdateOptions } from '../types'

/**
 * 全局 Message 堆叠状态仓库
 *
 * 所有命令式调用（Message.success 等）都把消息推入此处，
 * 由唯一的 MessageContainer 通过 useSyncExternalStore 订阅并堆叠渲染
 * 组件库不依赖 signal，这里用最小化的发布订阅实现
 */

let items: MessageItemData[] = []
let seed = 0
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export const messageStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /** 返回稳定引用，仅在内容变化时生成新数组 */
  getSnapshot(): MessageItemData[] {
    return items
  },

  /** 新增一条消息，追加到队尾（视觉上堆叠在最底部），返回其唯一 id */
  add(data: Omit<MessageItemData, 'id'>) {
    const id = ++seed
    items = [...items, { ...data, id }]
    emit()
    return id
  },

  /** 原地更新存活的消息；保留 id、顺序及未传字段，关闭后更新为无操作 */
  update(id: number, options: MessageUpdateOptions) {
    const target = items.find((item) => item.id === id)
    if (!target) return

    items = items.map((item) => item.id === id
      ? {
        ...item,
        ...options,
        duration: options.duration ?? item.duration,
        variant: options.variant ?? item.variant,
      }
      : item)
    emit()
  },

  /** 移除指定消息，并触发其 onClose 回调（定时、手动、溢出关闭均走此路径） */
  remove(id: number) {
    const target = items.find((item) => item.id === id)
    if (!target) {
      return
    }

    items = items.filter((item) => item.id !== id)
    emit()
    target.onClose?.()
  },
}

type Listener = () => void
