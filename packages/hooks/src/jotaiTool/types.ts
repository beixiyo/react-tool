/* eslint-disable */
import type { ExtractAtomValue } from 'jotai'

/** 类型定义：提取有效的 key */
export type ValidKeys<Atoms extends Record<string, any>> = {
  [K in keyof Atoms]: K extends string
    ? K extends `_${string}`
      ? never
      : K
    : never
}[keyof Atoms]

/** 类型定义：Result 类型 */
export type Result<Atoms extends Record<string, any>> = {
  [K in ValidKeys<Atoms>]: ExtractAtomValue<Atoms[K]>
} & {
  [K in ValidKeys<Atoms> as SetterName<K>]: AtomSetter<Atoms[K]>
}

/** 辅助类型：获取 setter 名称 */
export type SetterName<K extends string> = `set${Capitalize<K>}`

/** 辅助类型：从 atom 类型提取 setter 类型 */
export type AtomSetter<A> = A extends import('jotai').Atom<infer Value>
  ? (value: Value | ((prev: Value) => Value)) => void
  : never

/** 类型定义：从 selectors 数组中提取有效的 key 类型 */
export type SelectorKeys<
  Atoms extends Record<string, any>,
  S extends readonly unknown[] | undefined,
> = S extends readonly (infer K)[]
  ? K extends ValidKeys<Atoms>
    ? K
    : never
  : never

/** 类型定义：根据 selectors 返回对应的 atom 值类型和 setter 类型 */
export type SelectorResult<
  Atoms extends Record<string, any>,
  S extends readonly ValidKeys<Atoms>[] | undefined,
> = S extends readonly any[]
? {
    [K in SelectorKeys<Atoms, S>]: ExtractAtomValue<Atoms[K]>
  }
  & {
    [K in SelectorKeys<Atoms, S> as SetterName<K>]: AtomSetter<Atoms[K]>
  }
  : Result<Atoms>

/**
 * @param innerSelectors 内部传递的 selectors：
 *  - 如果传入 undefined，则继承外部的 `selectors`
 *  - 如果传入空数组 `[]`，表示重置所有 atom
 *  - 如果传入非空数组，重置指定的 atom
 *
 * @returns 返回一个 reset 函数，调用时会根据 selectors 执行重置操作
 *
 * @example
 * const reset = useReset()
 * reset([]) // 空数组表示重置所有 atom
 * reset() // 不传递则继承外部的 selectors
 * reset(['name']) // 重置 name atom
 * reset(['name', 'age']) // 重置 name 和 age atom
 */
export type ResetFn<Atoms extends Record<string, any>> = {
  (innerSelectors?: readonly ValidKeys<Atoms>[]): void
}

export type ReturnHooks<Atoms extends Record<string, any>> = {
  /**
   * 获取 atom 的 hook，支持选择性订阅，只订阅指定的 atom 可以避免不必要的重新渲染
   *
   * @param selectors 可选的 selector 数组，指定要获取的 atom。如果不传递，则返回所有 atom
   *
   * @returns 返回一个 Proxy 对象，包含所有 atom 的值和 setter 函数。支持直接赋值（如 `atoms.count = 1`）和调用 setter（如 `atoms.setCount(1)`）
   *
   * @example
   * const atoms = useAtoms() // 不传递 selectors 则返回所有 atom
   *
   * atoms.name // 获取 name atom 的值
   * atoms.setName('Test') // 设置 name atom 的值
   * atoms.name = 'New Name' // 直接赋值（浅层响应式）
   */
  useAtoms: <S extends readonly ValidKeys<Atoms>[] | undefined>(selectors?: S) => SelectorResult<Atoms, S>

  /**
   * 重置 atom 的 hook（组件内部使用）
   * @param selectors 可选的 selector 数组，指定要重置的 atom。如果不传递，则重置所有 atom
   *
   * @returns 返回一个 reset 函数，调用时会重置指定的 atom
   *
   * @example
   * const reset = useReset()
   * reset([]) // 空数组表示重置所有 atom
   * reset() // 不传递则继承外部的 selectors
   * reset(['name']) // 重置 name atom
   * reset(['name', 'age']) // 重置 name 和 age atom
   */
  useReset: (selectors?: readonly ValidKeys<Atoms>[]) => ResetFn<Atoms>

  /**
   * 创建组件外部的 reset 函数（不使用 React hooks）
   * 使用 Jotai 的 `getDefaultStore()` 和 `RESET` 符号来实现重置功能
   *
   * @returns 返回一个 reset 函数，可以在组件外部调用
   *
   * @example
   * const { createReset } = createUseAtoms({
   *   count: atomWithReset(0),
   *   name: atomWithReset('Test'),
   * })
   *
   * // 在组件外部使用
   * const reset = createReset()
   * reset() // 重置所有 atom
   * reset(['name']) // 重置 name atom
   * reset(['count', 'name']) // 重置 count 和 name atom
   */
  createReset: () => ResetFn<Atoms>

  /**
   * 获取组件外部的 atoms 代理对象（不使用 React hooks）
   * 使用 Jotai 的 `getDefaultStore()` 来实现响应式代理
   * 支持直接赋值和调用 setter 方法，每次读取都会获取最新的 store 值
   * 注意：外部使用不需要 selector，因为不存在渲染优化问题
   *
   * @returns 返回一个 Proxy 对象，包含所有 atom 的值和 setter 函数。支持直接赋值（如 `atoms.count = 1`）和调用 setter（如 `atoms.setCount(1)`）
   *
   * @example
   * const { getAtoms } = createUseAtoms({
   *   count: atom(0),
   *   name: atom('Test'),
   * })
   *
   * // 在组件外部使用
   * const atoms = getAtoms()
   * const count = atoms.count // 读取值（实时获取最新值）
   * atoms.count = 10 // 直接赋值
   * atoms.setCount(20) // 调用 setter
   * atoms.setCount(prev => prev + 1) // 函数式更新（支持回调形式）
   */
  getAtoms: () => Result<Atoms>
}

export type CreateUseAtoms = {
  /**
   * 创建一个用于管理多个 Jotai atom 的工具函数
   * 返回的 hook 支持选择性订阅、浅层响应式更新和重置功能
   *
   * @param atoms - 需要创建的 atom 对象，键名不能以 `_` 开头
   * @returns 包含 `useAtoms`、`useReset`、`createReset` 和 `getAtoms` 的对象
   * @example
   * const { useAtoms, useReset, createReset, getAtoms } = createUseAtoms({
   *   count: atom(0),
   *   name: atomWithReset('Test'),
   * })
   *
   * // 组件内部使用
   * function Component() {
   *   const atoms = useAtoms() // 不传递 selectors 则返回所有 atom，可能导致多余的渲染
   *   const reset = useReset(['name']) // 传递 selectors 则返回对应的 reset 函数
   *
   *   return (
   *     <div>
   *       <div>Count: {atoms.count}</div>
   *       <div>Name: {atoms.name}</div>
   *
   *       // 更新值，支持浅层响应式和函数式
   *       <button onClick={() => atoms.count++}>count ++</button>
   *       <button onClick={() => atoms.setCount(prev => prev + 1)}>count ++</button>
   *
   *       // 重置 name atom
   *       <button onClick={reset}>Reset</button>
   *     </div>
   *   )
   * }
   *
   * // 组件外部使用
   * const reset = createReset()
   * reset() // 重置所有 atom
   * reset(['name']) // 重置 name atom
   *
   * const atoms = getAtoms()
   * atoms.count = 10 // 直接赋值
   * atoms.setCount(20) // 调用 setter
   * atoms.setCount(prev => prev + 1) // 函数式更新（支持回调形式）
   */
  <Atoms extends Record<string, any>>(atoms: Atoms): ReturnHooks<Atoms>
}
