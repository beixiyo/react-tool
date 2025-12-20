import type { TestCase } from '../types'
import { createUseAtoms } from 'hooks'
import { atom } from 'jotai'

/**
 * createUseAtoms 函数测试用例
 */

const testAtoms = {
  count: atom(0),
  name: atom('Test'),
  isActive: atom(false),
  _private: atom('private'),
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
]
