import { Z } from '../../constants/z-index'

/**
 * 全局 Modal 栈管理
 *
 * 解决多层 Modal 叠加的三个问题：
 * 1. z-index 自增 —— 每次打开分配一个递增层级（基于项目的 createZIndexStore），后开的一定在上层
 * 2. 栈顶感知 —— 仅栈顶 Modal 响应 ESC、显示遮罩，避免「一次 ESC 全关」与「遮罩越叠越黑」
 *
 * 组件库不依赖 signal，这里用最小化的发布订阅 + useSyncExternalStore 对接
 */

let stack: ModalEntry[] = []
let snapshot: number[] = []
let seed = 0
let activationOrder = 0
let autoZIndex = Z.modal
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export const modalStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /** 返回稳定引用，仅在栈变化时生成新数组 */
  getSnapshot(): number[] {
    return snapshot
  },

  /** 为一个 Modal 实例申请唯一 id（组件挂载期间固定不变） */
  nextId() {
    return ++seed
  },

  /** 打开：入栈并分配一个递增的 z-index（已在栈中则仅刷新层级到最高） */
  open(id: number, explicitZIndex?: number) {
    stack = stack.filter(item => item.id !== id)
    const zIndex = explicitZIndex ?? Math.min(++autoZIndex, Z.popover - 1)
    stack = [
      ...stack,
      { id, zIndex, order: ++activationOrder },
    ].sort((a, b) => a.zIndex - b.zIndex || a.order - b.order)
    snapshot = stack.map(item => item.id)
    emit()
    return zIndex
  },

  /** 关闭：出栈 */
  close(id: number) {
    if (!stack.some(item => item.id === id)) {
      return
    }
    stack = stack.filter(item => item.id !== id)
    snapshot = stack.map(item => item.id)
    if (stack.length === 0)
      autoZIndex = Z.modal
    emit()
  },

  /** 是否为当前栈顶（最上层）Modal */
  isTop(id: number) {
    return snapshot.length > 0 && snapshot[snapshot.length - 1] === id
  },
}

type Listener = () => void

interface ModalEntry {
  id: number
  zIndex: number
  order: number
}
