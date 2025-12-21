/* eslint-disable */
import {
  useAtom,
  useAtomValue,
  useSetAtom,
} from 'jotai'
import { selectAtom, useResetAtom } from 'jotai/utils'
import { useMemo, useRef } from 'react'
import type { ValidKeys, SelectorResult, ReturnHooks, ResetFn, CreateUseAtoms } from './types'
import { useStableSignature } from './utils'

// 文档详见类型注释
export const createUseAtoms: CreateUseAtoms = <Atoms extends Record<string, any>>(atoms: Atoms) => {
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

  const useAtoms: ReturnHooks<Atoms>['useAtoms'] = <
    S extends readonly ValidKeys<Atoms>[] | undefined,
  >(selectors?: S) => {
    /** 使用 Set 去重 selectors */
    const selectedKeys = selectors
      ? Array.from(new Set(selectors))
      : undefined

    const validEntries = useMemo(() => getValidEntries(), [])

    // 运行时检查：保证 selectedKeys 与 validEntries 在多次渲染中稳定，否则抛错
    useStableSignature('useAtoms', {
      selectedKeys,
      validKeys: validEntries.map(([k]) => k),
    })

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

  const useReset: ReturnHooks<Atoms>['useReset'] = (selectors) => {
    const validEntries = useMemo(() => getValidEntries(), [])

    // 运行时检查：保证 validEntries 签名在多次渲染中稳定，否则抛错
    useStableSignature('useReset', validEntries.map(([k]) => k))

    /** 使用 ref 存储 reset 函数映射，避免在每次渲染时重新创建 */
    const resetFunctionsRef = useRef<Map<string, () => void>>(new Map())

    /** 在组件顶层调用所有的 useResetAtom hooks（保持 hooks 调用数量稳定） */
    validEntries.forEach(([key, atom]) => {
      /** 由于 validEntries 是稳定的，hooks 调用数量也是稳定的 */
      const resetFn = useResetAtom(atom)
      /** 更新 ref，使用最新的 reset 函数 */
      resetFunctionsRef.current.set(key, resetFn)
    })

    return useMemo<ResetFn<Atoms>>(() => {
      return (innerSelectors) => {
        // 如果显式传入 innerSelectors
        if (innerSelectors !== undefined) {
          // 传入空数组表示重置所有 atom
          if (innerSelectors.length === 0) {
            for (const fn of resetFunctionsRef.current.values()) {
              fn()
            }
            return
          }

          // 重置指定的 atom（非空数组）
          for (const key of innerSelectors) {
            const fn = resetFunctionsRef.current.get(key as string)
            fn?.()
          }
          return
        }

        // innerSelectors 未传，使用外部 selectors
        if (selectors && selectors.length > 0) {
          for (const key of selectors) {
            const fn = resetFunctionsRef.current.get(key as string)
            fn?.()
          }
          return
        }

        // 外部 selectors 也不存在或为空：重置所有 atom
        for (const fn of resetFunctionsRef.current.values()) {
          fn()
        }
      }
    }, [selectors])
  }

  return {
    useAtoms,
    useReset,
  } as ReturnHooks<Atoms>
}
