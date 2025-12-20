import { atom, useAtom, useAtomValue, type Atom, type ExtractAtomValue, type WritableAtom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useMemo, useRef } from 'react'


/**
 * 使用 selectAtom 优化订阅的辅助函数（只读）
 */
export function useSelectAtom<T, S>(
  anAtom: Atom<T>,
  selector: (value: T) => S,
  equalityFn?: (a: S, b: S) => boolean
): S {
  return useAtomValue(selectAtom(anAtom, selector, equalityFn))
}

/**
 * 创建一个可写的派生 atom，支持直接更新嵌套属性
 *
 * 这个函数通过创建一个带有 write 函数的派生 atom 来实现
 * 当更新派生 atom 时，会自动更新原始 atom 的对应部分
 *
 * 示例：
 * ```ts
 * const userAtom = atom({ name: 'John', age: 30, theme: 'dark' })
 *
 * function Component() {
 *   // 只订阅 name 属性，支持直接更新
 *   const [name, setName] = useSelectAtomWithSetter(
 *     userAtom,
 *     (user) => user.name,
 *     (user, newName) => ({ ...user, name: newName })
 *   )
 *
 *   return (
 *     <div>
 *       <div>{name}</div>
 *       <button onClick={() => setName('New Name')}>Update Name</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSelectAtomWithSetter<T, S>(
  anAtom: WritableAtom<T, [T], unknown>,
  selector: (value: T) => S,
  updater: (value: T, newSlice: S) => T
): [S, (newSlice: S | ((prev: S) => S)) => void] {
  return useAtom(atom(
    (get) => selector(get(anAtom)),
    (get, set, newSlice: S | ((prev: S) => S)) => {
      const currentValue = get(anAtom)
      const currentSlice = selector(currentValue)
      const nextSlice =
        typeof newSlice === 'function'
          ? (newSlice as (prev: S) => S)(currentSlice)
          : newSlice
      const nextValue = updater(currentValue, nextSlice)
      set(anAtom, nextValue)
    },
  ))
}


export function createUseAtoms<Atoms extends Record<string, any>>(
  atoms: Atoms
) {
  return function useAtoms(): Result {
    const entries = Object.entries(atoms) as [keyof Atoms, Atoms[keyof Atoms]][]

    // 收集所有有效的 key 和对应的 atom
    const validEntries = entries.filter(
      ([key]) => typeof key === 'string' && !key.startsWith('_')
    ) as Array<[string, Atoms[string]]>

    // 在组件顶层调用所有的 useAtom hooks
    const atomStates = validEntries.map(([, atom]) => useAtom(atom))

    // 使用 useRef 存储 setter 函数，避免在 Proxy 中重复创建
    const settersRef = useRef<Record<string, (...args: any[]) => void>>({})
    const valuesRef = useRef<Record<string, any>>({})

    // 更新 refs：存储 setter 和当前值
    validEntries.forEach(([key], index) => {
      const [value, setValue] = atomStates[index]
      valuesRef.current[key] = value
      settersRef.current[key] = setValue as (...args: any[]) => void
    })

    // 创建 Proxy 代理对象
    const proxy = useMemo(() => {
      return new Proxy({} as Result, {
        get(target, prop: string | symbol) {
          // 处理 setter 方法（如 setVal）
          if (typeof prop === 'string' && prop.startsWith('set')) {
            const key = prop.slice(3).charAt(0).toLowerCase() + prop.slice(4)
            if (settersRef.current[key]) {
              return settersRef.current[key]
            }
          }

          // 处理普通属性访问
          if (typeof prop === 'string' && valuesRef.current.hasOwnProperty(prop)) {
            return valuesRef.current[prop]
          }

          return undefined
        },
        set(target, prop: string | symbol, value: any) {
          // 当设置属性时，自动调用对应的 setValue
          if (typeof prop === 'string' && settersRef.current[prop]) {
            settersRef.current[prop](value)
            // 注意：这里不直接更新 valuesRef，因为 atom 更新后会触发组件重新渲染
            // 重新渲染时会通过上面的 forEach 更新 valuesRef.current
            return true
          }
          return false
        },
        has(target, prop: string | symbol) {
          if (typeof prop === 'string') {
            return (
              valuesRef.current.hasOwnProperty(prop) ||
              (prop.startsWith('set') &&
                settersRef.current.hasOwnProperty(
                  prop.slice(3).charAt(0).toLowerCase() + prop.slice(4)
                ))
            )
          }
          return false
        },
        ownKeys(target) {
          const keys = Object.keys(valuesRef.current)
          const setterKeys = keys.map(
            (key) => `set${key.charAt(0).toUpperCase() + key.slice(1)}`
          )
          return [...keys, ...setterKeys]
        },
        getOwnPropertyDescriptor(target, prop: string | symbol) {
          if (typeof prop === 'string') {
            if (valuesRef.current.hasOwnProperty(prop)) {
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

  type ValidKeys = {
    [K in keyof Atoms]: K extends string
    ? K extends `_${string}`
    ? never
    : K
    : never
  }[keyof Atoms]

  type AtomValue<K extends ValidKeys> = ExtractAtomValue<Atoms[K]>
  type AtomSetterType<K extends ValidKeys> = AtomSetter<Atoms[K]>

  type Result = {
    [K in ValidKeys]: AtomValue<K>
  } & {
    [K in ValidKeys as SetterName<K>]: AtomSetterType<K>
  }
}


// 辅助类型：获取 setter 名称
type SetterName<K extends string> = `set${Capitalize<K>}`

// 辅助类型：从 atom 类型提取 setter 类型
type AtomSetter<A> = A extends import('jotai').Atom<infer Value>
  ? (value: Value | ((prev: Value) => Value)) => void
  : never