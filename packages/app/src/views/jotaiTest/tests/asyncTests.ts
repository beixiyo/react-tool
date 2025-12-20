import type { TestCase } from '../types'
import { atom, getDefaultStore } from 'jotai'

/**
 * Async atom 测试用例
 */

const asyncValueAtom = atom(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return 'async-result'
})

const baseCountAtom = atom(5)
const asyncDerivedAtom = atom(async (get) => {
  const count = get(baseCountAtom)
  await new Promise(resolve => setTimeout(resolve, 50))
  return `Count: ${count}`
})

export const asyncTests: TestCase[] = [
  {
    name: 'Async Atom - 基本异步',
    description: '测试异步 atom 的基本功能',
    run: async () => {
      try {
        const store = getDefaultStore()
        const value = await store.get(asyncValueAtom)
        return {
          success: value === 'async-result',
          message: `异步值: ${value}`,
          expected: 'async-result',
          actual: String(value),
        }
      }
      catch (error) {
        return {
          success: false,
          message: `错误: ${error}`,
          expected: 'async-result',
          actual: 'error',
        }
      }
    },
  },
  {
    name: 'Async Atom - 异步派生',
    description: '测试从同步 atom 派生的异步 atom',
    run: async () => {
      try {
        const store = getDefaultStore()
        store.set(baseCountAtom, 5)
        const value = await store.get(asyncDerivedAtom)
        return {
          success: value === 'Count: 5',
          message: `异步派生值: ${value}`,
          expected: 'Count: 5',
          actual: String(value),
        }
      }
      catch (error) {
        return {
          success: false,
          message: `错误: ${error}`,
          expected: 'Count: 5',
          actual: 'error',
        }
      }
    },
  },
]
