import { atom } from 'jotai'
import { getDefaultStore } from 'jotai'
import type { TestCase } from '../types'

/**
 * Writable derived atom 测试用例
 */

const countAtom = atom(0)
const incrementAtom = atom(
  (get) => get(countAtom),
  (get, set, _arg?: unknown) => set(countAtom, get(countAtom) + 1),
)

export const writableTests: TestCase[] = [
  {
    name: 'Writable Derived Atom - 读取值',
    description: '测试读取 writable derived atom 的值',
    run: async () => {
      const store = getDefaultStore()
      store.set(countAtom, 0)
      const count = store.get(incrementAtom)
      return {
        success: typeof count === 'number',
        message: `当前值: ${count}`,
        expected: 'number',
        actual: typeof count,
      }
    },
  },
  {
    name: 'Writable Derived Atom - 写入操作',
    description: '测试 writable derived atom 的写入功能',
    run: async () => {
      const store = getDefaultStore()
      store.set(countAtom, 5)
      const initialCount = store.get(incrementAtom)
      store.set(incrementAtom, undefined)
      const newCount = store.get(incrementAtom)
      return {
        success: newCount === initialCount + 1,
        message: `更新后的值: ${newCount}`,
        expected: String(initialCount + 1),
        actual: String(newCount),
      }
    },
  },
  {
    name: 'Writable Derived Atom - 多次操作',
    description: '测试多次调用 writable derived atom',
    run: async () => {
      const store = getDefaultStore()
      store.set(countAtom, 10)
      const initialCount = store.get(incrementAtom)
      store.set(incrementAtom, undefined)
      store.set(incrementAtom, undefined)
      store.set(incrementAtom, undefined)
      const newCount = store.get(incrementAtom)
      return {
        success: newCount === initialCount + 3,
        message: `三次更新后的值: ${newCount}`,
        expected: String(initialCount + 3),
        actual: String(newCount),
      }
    },
  },
]

