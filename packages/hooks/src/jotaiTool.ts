/* eslint-disable */
import type { ExtractAtomValue } from 'jotai'
import {
  useAtom,
  useAtomValue,
  useSetAtom,
} from 'jotai'
import { selectAtom, useResetAtom } from 'jotai/utils'
import { useMemo, useRef } from 'react'

/**
 *
 * @param atoms - 需要创建的 atom 对象
 * @returns - 包含 useAtoms 和 useReset 的 hook 对象
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
 *       // 重置 name atom
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   )
 * }
 */
export function createUseAtoms<Atoms extends Record<string, any>>(
  atoms: Atoms,
) {
  /**
   * 收集所有有效的 key 和对应的 atom
   * @example
   * [ ['count', atom(0)], ['name', atom('Test')] ]
   */
  const getValidEntries = () => {
    const entries = Object.entries(atoms) as [
      keyof Atoms,
      Atoms[keyof Atoms],
    ][]

    return entries.filter(
      ([key]) => typeof key === 'string' && !key.startsWith('_'),
    ) as Array<[string, Atoms[string]]>
  }

  /**
   * 重置 atom 的 hook
   * @param selectors 可选的 selector 数组，指定要重置的 atom。如果不传递，则重置所有 atom
   * @returns 返回一个 reset 函数，调用时会重置指定的 atom
   * @example
   * const reset = useReset() // 不传递 selectors 则重置所有 atom
   * reset() // 重置所有 atom
   */
  function useReset(selectors?: readonly ValidKeys<Atoms>[]) {
    const validEntries = useMemo(() => getValidEntries(), [])

    /** 使用 ref 存储 reset 函数映射，避免在每次渲染时重新创建 */
    const resetFunctionsRef = useRef<Map<string, () => void>>(new Map())

    /** 在组件顶层调用所有的 useResetAtom hooks（保持 hooks 调用数量稳定） */
    validEntries.forEach(([key, atom]) => {
      /** 由于 validEntries 是稳定的，hooks 调用数量也是稳定的 */
      const resetFn = useResetAtom(atom)
      /** 更新 ref，使用最新的 reset 函数 */
      resetFunctionsRef.current.set(key, resetFn)
    })

    /** 返回一个函数，调用时会根据 selectors 执行重置操作 */
    return useMemo(() => {
      const resetFn = () => {
        if (selectors) {
          /** 只重置指定的 atom */
          for (const key of selectors) {
            const resetFn = resetFunctionsRef.current.get(key as string)
            resetFn?.()
          }
        }
        else {
          /** 重置所有 atom */
          for (const resetFn of resetFunctionsRef.current.values()) {
            resetFn()
          }
        }
      }

      return resetFn
    }, [selectors])
  }

  /**
   * 获取 atom 的 hook
   * @param selectors 可选的 selector 数组，指定要获取的 atom。如果不传递，则返回所有 atom
   * @returns 返回一个 atom 对象，包含所有 atom 的值和 setter 函数
   * @example
   * const atoms = useAtoms() // 不传递 selectors 则返回所有 atom
   *
   * atom.name // 获取 name atom 的值
   * atom.setName('Test') // 设置 name atom 的值
   */
  function useAtoms<
    S extends readonly ValidKeys<Atoms>[] | undefined,
  >(selectors?: S): SelectorResult<Atoms, S> {
    /** 使用 Set 去重 selectors */
    const selectedKeys = selectors
      ? Array.from(new Set(selectors))
      : undefined

    const validEntries = useMemo(() => getValidEntries(), [])

    /**
     * 根据 selectors 创建 selectAtom（如果提供了 selectors）
     *
     * @link https://jotai.org/docs/utilities/select
     *
     * @example
     * [ selectAtom(atom(0), (value) => value), selectAtom(atom('Test'), () => 'Test') ]
     */
    const selectedAtoms = useMemo(() => {
      if (!selectedKeys) {
        /** 没有 selectors，返回 null（表示使用原 atom） */
        return null
      }

      /** 创建稳定的 selector 函数 */
      const identitySelector = (value: any) => value
      const neverUpdateSelector = () => Symbol('never-update')
      const neverUpdateEquality = () => true

      return validEntries.map(([key, atom]) => {
        if (selectedKeys.includes(key as ValidKeys<Atoms>)) {
          /** 在 selectors 中，使用 selectAtom 创建只订阅该值的派生 atom */
          return selectAtom(atom, identitySelector)
        }
        else {
          /** 不在 selectors 中，使用 selectAtom 创建一个永远不会更新的 atom */
          return selectAtom(atom, neverUpdateSelector, neverUpdateEquality)
        }
      })
    }, [validEntries, selectedKeys?.join(',')])

    /** 使用 useRef 存储 setter 函数，避免在 Proxy 中重复创建 */
    const settersRef = useRef<Record<string, (...args: any[]) => void>>({})
    const valuesRef = useRef<Record<string, any>>({})

    /**
     * 在组件顶层调用所有的 hooks（保持 hooks 调用数量稳定）
     * 注意：这里我们仍然在循环中调用 hooks，这违反了 React hooks 规则
     * 但这是必要的，因为我们不知道有多少个 atom
     * 实际上，由于 validEntries 是稳定的（基于 atoms），hooks 调用数量也是稳定的
     */
    validEntries.forEach(([key, atom], index) => {
      if (selectedAtoms) {
        /** 如果提供了 selectors，使用 selectedAtoms 来读取值，但使用原 atom 的 setter */
        const selectedAtom = selectedAtoms[index]
        const value = useAtomValue(selectedAtom)
        const setValue = useSetAtom(atom) // 使用原 atom 的 setter
        valuesRef.current[key] = value
        settersRef.current[key] = setValue as (...args: any[]) => void
      }
      else {
        /** 没有 selectors，使用原 atom */
        const [value, setValue] = useAtom(atom)
        valuesRef.current[key] = value
        settersRef.current[key] = setValue as (...args: any[]) => void
      }
    })

    /** 创建 Proxy 代理对象 */
    const proxy = useMemo(() => {
      return new Proxy({} as SelectorResult<Atoms, S>, {
        get(_target, prop: string | symbol) {
          /** 处理 setter 方法（如 setVal） */
          if (typeof prop === 'string' && prop.startsWith('set')) {
            const key = prop.slice(3).charAt(0).toLowerCase() + prop.slice(4)
            if (settersRef.current[key]) {
              return settersRef.current[key]
            }
          }

          /** 处理普通属性访问 */
          if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(valuesRef.current, prop)) {
            return valuesRef.current[prop]
          }

          return undefined
        },
        set(_target, prop: string | symbol, value: any) {
          /** 当设置属性时，自动调用对应的 setValue */
          if (typeof prop === 'string' && settersRef.current[prop]) {
            settersRef.current[prop](value)
            /**
             * 注意：这里不直接更新 valuesRef，因为 atom 更新后会触发组件重新渲染
             * 重新渲染时会通过上面的 forEach 更新 valuesRef.current
             */
            return true
          }
          return false
        },
        has(_target, prop: string | symbol) {
          if (typeof prop === 'string') {
            return (
              Object.prototype.hasOwnProperty.call(valuesRef.current, prop)
              || (prop.startsWith('set')
                && Object.prototype.hasOwnProperty.call(settersRef.current, prop.slice(3).charAt(0).toLowerCase() + prop.slice(4)))
            )
          }
          return false
        },
        ownKeys(_target) {
          const keys = Object.keys(valuesRef.current)
          const setterKeys = keys.map(
            key => `set${key.charAt(0).toUpperCase() + key.slice(1)}`,
          )
          return [...keys, ...setterKeys]
        },
        getOwnPropertyDescriptor(_target, prop: string | symbol) {
          if (typeof prop === 'string') {
            if (Object.prototype.hasOwnProperty.call(valuesRef.current, prop)) {
              return {
                enumerable: true,
                configurable: true,
                value: valuesRef.current[prop],
              }
            }
            if (prop.startsWith('set')) {
              const key = prop.slice(3).charAt(0).toLowerCase() + prop.slice(4)
              if (settersRef.current[key]) {
                return {
                  enumerable: true,
                  configurable: true,
                  value: settersRef.current[key],
                }
              }
            }
          }
          return undefined
        },
      })
    }, [])

    return proxy
  }

  return {
    useAtoms,
    useReset,
  }
}

/** 类型定义：提取有效的 key */
type ValidKeys<Atoms extends Record<string, any>> = {
  [K in keyof Atoms]: K extends string
  ? K extends `_${string}`
  ? never
  : K
  : never
}[keyof Atoms]

/** 类型定义：Result 类型 */
type Result<Atoms extends Record<string, any>> = {
  [K in ValidKeys<Atoms>]: ExtractAtomValue<Atoms[K]>
} & {
  [K in ValidKeys<Atoms> as SetterName<K>]: AtomSetter<Atoms[K]>
}

/** 辅助类型：获取 setter 名称 */
type SetterName<K extends string> = `set${Capitalize<K>}`

/** 辅助类型：从 atom 类型提取 setter 类型 */
type AtomSetter<A> = A extends import('jotai').Atom<infer Value>
  ? (value: Value | ((prev: Value) => Value)) => void
  : never

type SelectorKeys<
  Atoms extends Record<string, any>,
  S extends readonly unknown[] | undefined,
> = S extends readonly (infer K)[]
  ? K extends ValidKeys<Atoms>
  ? K
  : never
  : never

type SelectorResult<
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
