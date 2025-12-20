import type { TestCase } from '../types'
import { atom, getDefaultStore } from 'jotai'

/**
 * Derived atom 测试用例
 */

const baseCountAtom = atom(5)
const doubledAtom = atom(get => get(baseCountAtom) * 2)
const nameAtom = atom('hello')
const upperNameAtom = atom(get => get(nameAtom).toUpperCase())
const combinedAtom = atom(get => ({
  count: get(baseCountAtom),
  doubled: get(doubledAtom),
}))

export const derivedTests: TestCase[] = [
  {
    name: 'Derived Atom - 基本派生',
    description: '测试从 primitive atom 派生值',
    run: async () => {
      const store = getDefaultStore()
      store.set(baseCountAtom, 5)
      const doubled = store.get(doubledAtom)
      return {
        success: doubled === 10,
        message: `派生值: ${doubled}`,
        expected: '10',
        actual: String(doubled),
      }
    },
  },
  {
    name: 'Derived Atom - 响应式更新',
    description: '测试当基础 atom 更新时，派生 atom 自动更新',
    run: async () => {
      const store = getDefaultStore()
      store.set(baseCountAtom, 10)
      const doubled = store.get(doubledAtom)
      return {
        success: doubled === 20,
        message: `更新后的派生值: ${doubled}`,
        expected: '20',
        actual: String(doubled),
      }
    },
  },
  {
    name: 'Derived Atom - 字符串转换',
    description: '测试派生 atom 的字符串操作',
    run: async () => {
      const store = getDefaultStore()
      store.set(nameAtom, 'hello')
      const upper = store.get(upperNameAtom)
      return {
        success: upper === 'HELLO',
        message: `大写字符串: ${upper}`,
        expected: 'HELLO',
        actual: String(upper),
      }
    },
  },
  {
    name: 'Derived Atom - 组合派生',
    description: '测试从多个 atom 组合派生',
    run: async () => {
      const store = getDefaultStore()
      store.set(baseCountAtom, 10)
      const combined = store.get(combinedAtom)
      return {
        success: combined.count === 10 && combined.doubled === 20,
        message: `组合值: ${JSON.stringify(combined)}`,
        expected: '{"count":10,"doubled":20}',
        actual: JSON.stringify(combined),
      }
    },
  },
]
