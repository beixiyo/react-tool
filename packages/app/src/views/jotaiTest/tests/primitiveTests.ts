import type { TestCase } from '../types'
import { atom, getDefaultStore } from 'jotai'

/**
 * Primitive atom 测试用例
 * 注意：这些测试使用 Jotai 的 store API 来避免在非组件环境中使用 useAtom
 */

const testCountAtom = atom(0)
const testNameAtom = atom('Test')

export const primitiveTests: TestCase[] = [
  {
    name: 'Primitive Atom - 读取值',
    description: '测试读取 primitive atom 的值',
    run: async () => {
      const store = getDefaultStore()
      store.set(testCountAtom, 0)
      const count = store.get(testCountAtom)
      return {
        success: count === 0,
        message: `读取值: ${count}`,
        expected: '0',
        actual: String(count),
      }
    },
  },
  {
    name: 'Primitive Atom - 设置值',
    description: '测试设置 primitive atom 的值',
    run: async () => {
      const store = getDefaultStore()
      store.set(testCountAtom, 10)
      const newCount = store.get(testCountAtom)
      return {
        success: newCount === 10,
        message: `设置后的值: ${newCount}`,
        expected: '10',
        actual: String(newCount),
      }
    },
  },
  {
    name: 'Primitive Atom - 函数式更新',
    description: '测试使用函数式更新 primitive atom',
    run: async () => {
      const store = getDefaultStore()
      store.set(testCountAtom, 0) // 重置
      store.set(testCountAtom, (prev: number) => prev + 5)
      const newCount = store.get(testCountAtom)
      return {
        success: newCount === 5,
        message: `函数式更新后的值: ${newCount}`,
        expected: '5',
        actual: String(newCount),
      }
    },
  },
  {
    name: 'Primitive Atom - 多个 atom',
    description: '测试同时使用多个 primitive atoms',
    run: async () => {
      const store = getDefaultStore()
      const count = store.get(testCountAtom)
      const name = store.get(testNameAtom)
      return {
        success: typeof count === 'number' && typeof name === 'string',
        message: `Count: ${count}, Name: ${name}`,
        expected: 'number, string',
        actual: `${typeof count}, ${typeof name}`,
      }
    },
  },
]
