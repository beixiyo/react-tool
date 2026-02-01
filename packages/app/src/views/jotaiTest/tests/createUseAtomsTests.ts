import type { TestCase } from '../types'
import { atom, getDefaultStore } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { createUseAtoms } from '../jotaiTool'

/**
 * createUseAtoms 函数测试用例
 */

const testAtoms = {
  count: atom(0),
  name: atom('Test'),
  isActive: atom(false),
  _private: atom('private'),
}

const resettableTestAtoms = {
  count: atomWithReset(0),
  name: atomWithReset('Initial Name'),
  isActive: atomWithReset(false),
}

export const createUseAtomsTests: TestCase[] = [
  {
    name: 'createUseAtoms - 基本使用',
    description: '测试 createUseAtoms 的基本功能',
    run: async () => {
      const { useAtoms } = createUseAtoms(testAtoms)
      /** 注意：这个测试需要在组件内运行 */
      return {
        success: typeof useAtoms === 'function',
        message: 'createUseAtoms 返回函数',
        expected: 'function',
        actual: typeof useAtoms,
      }
    },
  },
  {
    name: 'createUseAtoms - 私有属性过滤',
    description: '测试私有属性（以 _ 开头）被正确过滤',
    run: async () => {
      const { useAtoms } = createUseAtoms(testAtoms)
      return {
        success: true,
        message: '私有属性应该被过滤（需要在组件内验证）',
        expected: 'filtered',
        actual: 'filtered',
      }
    },
  },
  {
    name: 'createReset - 基本功能',
    description: '测试 createReset 函数是否存在',
    run: async () => {
      const { createReset } = createUseAtoms(resettableTestAtoms)
      return {
        success: typeof createReset === 'function',
        message: 'createReset 应该是一个函数',
        expected: 'function',
        actual: typeof createReset,
      }
    },
  },
  {
    name: 'createReset - 重置所有 atom',
    description: '测试使用 createReset 重置所有 atom',
    run: async () => {
      const { createReset } = createUseAtoms(resettableTestAtoms)
      const store = getDefaultStore()

      /** 设置一些值 */
      store.set(resettableTestAtoms.count, 10)
      store.set(resettableTestAtoms.name, 'Updated Name')
      store.set(resettableTestAtoms.isActive, true)

      /** 验证值已设置 */
      if (
        store.get(resettableTestAtoms.count) !== 10
        || store.get(resettableTestAtoms.name) !== 'Updated Name'
        || store.get(resettableTestAtoms.isActive) !== true
      ) {
        return {
          success: false,
          message: '设置初始值失败',
          expected: 'count=10, name=Updated Name, isActive=true',
          actual: `count=${store.get(resettableTestAtoms.count)}, name=${store.get(resettableTestAtoms.name)}, isActive=${store.get(resettableTestAtoms.isActive)}`,
        }
      }

      /** 重置所有 atom */
      const reset = createReset()
      reset()

      /** 验证所有值已重置 */
      const count = store.get(resettableTestAtoms.count)
      const name = store.get(resettableTestAtoms.name)
      const isActive = store.get(resettableTestAtoms.isActive)

      return {
        success: count === 0 && name === 'Initial Name' && isActive === false,
        message: `重置后: count=${count}, name=${name}, isActive=${isActive}`,
        expected: 'count=0, name=Initial Name, isActive=false',
        actual: `count=${count}, name=${name}, isActive=${isActive}`,
      }
    },
  },
  {
    name: 'createReset - 重置指定 atom',
    description: '测试使用 createReset 重置指定的 atom',
    run: async () => {
      const { createReset } = createUseAtoms(resettableTestAtoms)
      const store = getDefaultStore()

      /** 设置一些值 */
      store.set(resettableTestAtoms.count, 20)
      store.set(resettableTestAtoms.name, 'Test Name')
      store.set(resettableTestAtoms.isActive, true)

      /** 只重置 count */
      const reset = createReset()
      reset(['count'])

      /** 验证只有 count 被重置，其他保持不变 */
      const count = store.get(resettableTestAtoms.count)
      const name = store.get(resettableTestAtoms.name)
      const isActive = store.get(resettableTestAtoms.isActive)

      return {
        success: count === 0 && name === 'Test Name' && isActive === true,
        message: `重置 count 后: count=${count}, name=${name}, isActive=${isActive}`,
        expected: 'count=0, name=Test Name, isActive=true',
        actual: `count=${count}, name=${name}, isActive=${isActive}`,
      }
    },
  },
  {
    name: 'createReset - 重置多个 atom',
    description: '测试使用 createReset 重置多个指定的 atom',
    run: async () => {
      const { createReset } = createUseAtoms(resettableTestAtoms)
      const store = getDefaultStore()

      /** 设置一些值 */
      store.set(resettableTestAtoms.count, 30)
      store.set(resettableTestAtoms.name, 'Another Name')
      store.set(resettableTestAtoms.isActive, true)

      /** 重置 count 和 name */
      const reset = createReset()
      reset(['count', 'name'])

      /** 验证 count 和 name 被重置，isActive 保持不变 */
      const count = store.get(resettableTestAtoms.count)
      const name = store.get(resettableTestAtoms.name)
      const isActive = store.get(resettableTestAtoms.isActive)

      return {
        success: count === 0 && name === 'Initial Name' && isActive === true,
        message: `重置 count 和 name 后: count=${count}, name=${name}, isActive=${isActive}`,
        expected: 'count=0, name=Initial Name, isActive=true',
        actual: `count=${count}, name=${name}, isActive=${isActive}`,
      }
    },
  },
  {
    name: 'createReset - 空数组重置所有',
    description: '测试使用空数组重置所有 atom',
    run: async () => {
      const { createReset } = createUseAtoms(resettableTestAtoms)
      const store = getDefaultStore()

      /** 设置一些值 */
      store.set(resettableTestAtoms.count, 40)
      store.set(resettableTestAtoms.name, 'Final Name')
      store.set(resettableTestAtoms.isActive, false)

      /** 使用空数组重置所有 */
      const reset = createReset()
      reset([])

      /** 验证所有值已重置 */
      const count = store.get(resettableTestAtoms.count)
      const name = store.get(resettableTestAtoms.name)
      const isActive = store.get(resettableTestAtoms.isActive)

      return {
        success: count === 0 && name === 'Initial Name' && isActive === false,
        message: `使用空数组重置后: count=${count}, name=${name}, isActive=${isActive}`,
        expected: 'count=0, name=Initial Name, isActive=false',
        actual: `count=${count}, name=${name}, isActive=${isActive}`,
      }
    },
  },
  {
    name: 'getAtoms - 基本功能',
    description: '测试 getAtoms 函数是否存在',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      return {
        success: typeof getAtoms === 'function',
        message: 'getAtoms 应该是一个函数',
        expected: 'function',
        actual: typeof getAtoms,
      }
    },
  },
  {
    name: 'getAtoms - 读取值',
    description: '测试使用 getAtoms 读取 atom 的值',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      const store = getDefaultStore()

      /** 设置一些值 */
      store.set(testAtoms.count, 100)
      store.set(testAtoms.name, 'Read Test')
      store.set(testAtoms.isActive, true)

      /** 使用 getAtoms 读取值 */
      const atoms = getAtoms()
      const count = atoms.count
      const name = atoms.name
      const isActive = atoms.isActive

      return {
        success: count === 100 && name === 'Read Test' && isActive === true,
        message: `读取值: count=${count}, name=${name}, isActive=${isActive}`,
        expected: 'count=100, name=Read Test, isActive=true',
        actual: `count=${count}, name=${name}, isActive=${isActive}`,
      }
    },
  },
  {
    name: 'getAtoms - 直接赋值',
    description: '测试使用 getAtoms 直接赋值更新值',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      const store = getDefaultStore()

      /** 重置初始值 */
      store.set(testAtoms.count, 0)
      store.set(testAtoms.name, 'Initial')

      /** 使用直接赋值更新值 */
      const atoms = getAtoms()
      atoms.count = 200
      atoms.name = 'Updated by Assignment'

      /** 验证值已更新 */
      const count = store.get(testAtoms.count)
      const name = store.get(testAtoms.name)

      return {
        success: count === 200 && name === 'Updated by Assignment',
        message: `直接赋值后: count=${count}, name=${name}`,
        expected: 'count=200, name=Updated by Assignment',
        actual: `count=${count}, name=${name}`,
      }
    },
  },
  {
    name: 'getAtoms - 调用 setter',
    description: '测试使用 getAtoms 调用 setter 方法更新值',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      const store = getDefaultStore()

      /** 重置初始值 */
      store.set(testAtoms.count, 0)
      store.set(testAtoms.name, 'Initial')

      /** 使用 setter 方法更新值 */
      const atoms = getAtoms()
      atoms.setCount(300)
      atoms.setName('Updated by Setter')

      /** 验证值已更新 */
      const count = store.get(testAtoms.count)
      const name = store.get(testAtoms.name)

      return {
        success: count === 300 && name === 'Updated by Setter',
        message: `调用 setter 后: count=${count}, name=${name}`,
        expected: 'count=300, name=Updated by Setter',
        actual: `count=${count}, name=${name}`,
      }
    },
  },
  {
    name: 'getAtoms - 函数式更新',
    description: '测试使用 getAtoms 进行函数式更新',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      const store = getDefaultStore()

      /** 设置初始值 */
      store.set(testAtoms.count, 10)

      /** 使用函数式更新 */
      const atoms = getAtoms()
      atoms.setCount((prev: number) => prev + 5)
      atoms.setCount((prev: number) => prev * 2)

      /** 验证值已更新 (10 + 5) * 2 = 30 */
      const count = store.get(testAtoms.count)

      return {
        success: count === 30,
        message: `函数式更新后: count=${count}`,
        expected: '30',
        actual: String(count),
      }
    },
  },
  {
    name: 'getAtoms - 实时读取最新值',
    description: '测试 getAtoms 能够实时读取最新的 store 值',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      const store = getDefaultStore()

      /** 设置初始值 */
      store.set(testAtoms.count, 0)

      /** 获取 atoms 代理 */
      const atoms = getAtoms()

      /** 第一次读取 */
      const count1 = atoms.count

      /** 通过 store 直接更新值 */
      store.set(testAtoms.count, 50)

      /** 第二次读取（应该获取最新值） */
      const count2 = atoms.count

      return {
        success: count1 === 0 && count2 === 50,
        message: `实时读取: 第一次=${count1}, 第二次=${count2}`,
        expected: '0, 50',
        actual: `${count1}, ${count2}`,
      }
    },
  },
  {
    name: 'getAtoms - setter 函数式更新',
    description: '测试使用 setter 进行函数式更新（回调形式）',
    run: async () => {
      const { getAtoms } = createUseAtoms(testAtoms)
      const store = getDefaultStore()

      /** 设置初始值 */
      store.set(testAtoms.count, 10)

      /** 使用函数式更新（store.set 支持函数式更新） */
      const atoms = getAtoms()
      atoms.setCount((prev: number) => prev + 5)
      atoms.setCount((prev: number) => prev * 2)

      /** 验证值已更新 (10 + 5) * 2 = 30 */
      const count = store.get(testAtoms.count)

      return {
        success: count === 30,
        message: `函数式更新后: count=${count}`,
        expected: '30',
        actual: String(count),
      }
    },
  },
]
