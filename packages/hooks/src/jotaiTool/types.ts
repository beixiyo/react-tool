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
   * 重置 atom 的 hook
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
}

export type CreateUseAtoms = {
  /**
   * 创建一个用于管理多个 Jotai atom 的工具函数
   * 返回的 hook 支持选择性订阅、浅层响应式更新和重置功能
   *
   * @param atoms - 需要创建的 atom 对象，键名不能以 `_` 开头
   * @returns 包含 `useAtoms` 和 `useReset` 的 hook 对象
   * @example
   * const { useAtoms, useReset } = createUseAtoms({
   *   count: atom(0),
   *   name: atomWithReset('Test'),
   * })
   *
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
   */
  <Atoms extends Record<string, any>>(atoms: Atoms): ReturnHooks<Atoms>
}
